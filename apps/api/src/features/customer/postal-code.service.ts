import { z } from 'zod';

import { AppError } from '../../shared/errors/AppError.js';

const postalLookupResponseSchema = z.array(
  z.object({
    Status: z.string(),
    PostOffice: z
      .array(
        z.object({
          Name: z.string(),
          District: z.string(),
          State: z.string(),
        }),
      )
      .nullable()
      .optional(),
  }),
);

export interface PostalArea {
  area: string;
  city: string;
  state: string;
}

export async function lookupPostalCode(postalCode: string): Promise<{ items: PostalArea[] }> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Postal lookup failed.');

    const result = postalLookupResponseSchema.parse(await response.json())[0];
    const items =
      result?.Status === 'Success'
        ? (result.PostOffice ?? []).map((office) => ({
            area: office.Name,
            city: office.District,
            state: office.State,
          }))
        : [];

    return {
      items: [...new Map(items.map((item) => [item.area, item])).values()],
    };
  } catch {
    throw new AppError(
      502,
      'POSTAL_LOOKUP_UNAVAILABLE',
      'Could not verify this PIN code right now.',
    );
  }
}

export async function assertPostalCodeExists(postalCode: string) {
  if (!(await lookupPostalCode(postalCode)).items.length) {
    throw new AppError(400, 'INVALID_POSTAL_CODE', 'Enter a valid Indian PIN code.');
  }
}
