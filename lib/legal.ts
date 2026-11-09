import { brand } from './brand';

/**
 * The legal settings behind the consent screen, the policy and the admin
 * retention tools. Bump POLICY_VERSION whenever the consent notice changes
 * materially: every login is then asked to consent again. Keep in sync with
 * wbillmobile/lib/core/legal.dart.
 */
export const POLICY_VERSION = '2026-11-09';
export const POLICY_DATE = '9 November 2026';

/** DPDP Rule 8(3): data and logs are kept at least this long after processing. */
export const RETENTION_DAYS = 365;
/** An account with no activity for this long is warned, then erased. */
export const INACTIVE_YEARS = 3;
/** Minimum warning before erasing an inactive account (DPDP Rule 8(2) as the benchmark). */
export const ERASURE_NOTICE_HOURS = 48;
/** The longest a rights request or grievance waits for an answer. */
export const RESPONSE_DAYS = 30;

/**
 * Who answers for WBill under DPDP Rule 9 and Section 13. Fill these in
 * before launch. Empty values are simply left out of the legal pages.
 */
export const legal = {
  /** Registered business name, e.g. "Example Technologies Pvt Ltd". */
  entityName: '',
  /** Name of the person who handles privacy questions and grievances. */
  grievanceOfficerName: '',
  /** Registered postal address. */
  postalAddress: '',
  email: brand.email,
};
