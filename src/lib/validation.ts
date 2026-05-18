import type { PhysicalReleaseCandidate, ValidationResult } from "../types";

const fourKTerms = [/4k/i, /uhd/i, /ultra\s*hd/i, /2160p/i];
const physicalTerms = [/blu[-\s]?ray/i, /\bdisc\b/i, /\b4k\s+ultra\s+hd\b/i];
const digitalTerms = [/digital/i, /stream/i, /vudu/i, /itunes/i, /movies anywhere/i, /prime video/i];
const dvdTerms = [/\bdvd\b/i];
const standardBluOnly = [/blu[-\s]?ray only/i, /^blu[-\s]?ray$/i, /standard blu[-\s]?ray/i];

function textFor(candidate: PhysicalReleaseCandidate): string {
  return [
    candidate.title,
    candidate.releaseTitle,
    candidate.format,
    candidate.editionName,
    candidate.labelOrDistributor,
    candidate.studio,
    JSON.stringify(candidate.raw ?? "")
  ]
    .filter(Boolean)
    .join(" ");
}

function hasAny(patterns: RegExp[], value: string): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

export function validatePhysical4KRelease(candidate: PhysicalReleaseCandidate): ValidationResult {
  const text = textFor(candidate);
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  const hasIdentifier = Boolean(candidate.upc || candidate.ean || candidate.gtin || candidate.asin);
  const hasReleaseSpecifics = Boolean(
    candidate.labelOrDistributor ||
      candidate.studio ||
      candidate.editionName ||
      candidate.country ||
      candidate.region ||
      candidate.releaseDate ||
      candidate.discCount
  );
  const says4K = hasAny(fourKTerms, text);
  const saysPhysical = candidate.mediaType === "physical" || hasAny(physicalTerms, text);
  const saysDigital = candidate.mediaType === "digital" || hasAny(digitalTerms, text);
  const saysDvd = hasAny(dvdTerms, text) && !says4K;
  const saysBluOnly = hasAny(standardBluOnly, text) && !says4K;

  if (saysDigital) warnings.push("Digital or streaming product signals found");
  if (saysDvd) warnings.push("DVD-only product signals found");
  if (saysBluOnly) warnings.push("Standard Blu-ray-only product signals found");

  if (saysDigital || saysDvd || saysBluOnly) {
    return {
      isPhysical4K: false,
      confidence: 0,
      reasons,
      warnings,
      provider: candidate.provider,
      status: "rejected"
    };
  }

  if (saysPhysical) {
    score += 30;
    reasons.push("Physical media product");
  } else {
    warnings.push("Physical media is not clearly confirmed");
  }

  if (says4K) {
    score += 35;
    reasons.push("Format indicates 4K UHD Blu-ray");
  } else {
    warnings.push("4K UHD Blu-ray format is not clearly confirmed");
  }

  if (hasIdentifier) {
    score += 15;
    reasons.push("Release identifier present");
  } else {
    warnings.push("No UPC, EAN, GTIN, or ASIN is present");
  }

  if (hasReleaseSpecifics) {
    score += 15;
    reasons.push("Release-specific metadata present");
  } else {
    warnings.push("Release-specific metadata is sparse");
  }

  const trustedProvider = /disq|upcmdb/i.test(candidate.provider);
  if (trustedProvider) {
    score += 5;
    reasons.push(`${candidate.provider} is configured as a physical-release provider`);
  } else if (candidate.provider && !trustedProvider) {
    warnings.push(`${candidate.provider} is a fallback source unless it explicitly confirms 4K UHD Blu-ray`);
  }

  const confidence = Math.min(100, score);
  const status = confidence >= 90 ? "confirmed" : confidence >= 70 ? "likely" : "unverified";

  return {
    isPhysical4K: status === "confirmed" || status === "likely",
    confidence,
    reasons,
    warnings,
    provider: candidate.provider,
    status
  };
}

export function manualValidation(provider = "Manual confirmation"): ValidationResult {
  return {
    isPhysical4K: true,
    confidence: 85,
    reasons: ["Manual confirmation"],
    warnings: ["This release was manually confirmed by the user"],
    provider,
    status: "manual"
  };
}
