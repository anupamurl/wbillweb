import { legal, RESPONSE_DAYS } from '@/lib/legal';

/** Who answers for WBill (DPDP Rule 9, Section 13). Blank settings are left out. */
export default function LegalContact() {
  return (
    <ul>
      {legal.entityName && <li>Business: {legal.entityName}</li>}
      <li>
        Privacy and grievance contact{legal.grievanceOfficerName ? `: ${legal.grievanceOfficerName}` : ''}
      </li>
      <li>
        Email: <a href={`mailto:${legal.email}`}>{legal.email}</a>
      </li>
      {legal.postalAddress && <li>Address: {legal.postalAddress}</li>}
      <li>We reply within {RESPONSE_DAYS} days, and never later than the legal limit of 90 days.</li>
    </ul>
  );
}
