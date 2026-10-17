import { z } from 'zod';

const assumptions = z.array(z.string().trim().min(1).max(240)).max(8);
export const projectileSchema = z.strictObject({
  type: z.literal('projectile_motion'),
  velocity: z.number().min(0).max(100),
  angle: z.number().min(0).max(90),
  gravity: z.number().min(0.1).max(30),
  velocityUnit: z.literal('m/s'),
  angleUnit: z.literal('deg'),
  gravityUnit: z.literal('m/s^2'),
  assumptions,
});
export const linearSchema = z.strictObject({
  type: z.literal('linear_function'),
  slope: z.number().min(-100).max(100),
  intercept: z.number().min(-1000).max(1000),
  xUnit: z.literal('unitless'),
  yUnit: z.literal('unitless'),
  assumptions,
});
export const problemSchema = z.discriminatedUnion('type', [projectileSchema, linearSchema]);
export const interpretationSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('supported'), problem: problemSchema }),
  z.strictObject({ status: z.literal('unsupported'), reason: z.string().min(1).max(400) }),
]);
export type Problem = z.infer<typeof problemSchema>;
export type Projectile = z.infer<typeof projectileSchema>;
export type Linear = z.infer<typeof linearSchema>;
export const samples: Problem[] = [
  {
    type: 'projectile_motion',
    velocity: 20,
    angle: 45,
    gravity: 9.81,
    velocityUnit: 'm/s',
    angleUnit: 'deg',
    gravityUnit: 'm/s^2',
    assumptions: [
      'Launch and landing at the same height.',
      'No air resistance; constant positive gravity.',
    ],
  },
  {
    type: 'linear_function',
    slope: 2,
    intercept: 1,
    xUnit: 'unitless',
    yUnit: 'unitless',
    assumptions: ['x and y are unitless real numbers.'],
  },
];
