import * as t from 'io-ts'

export const RefreshTokensEntityContract = t.interface({
  id: t.number, // integer nullable: NO
  created_at: t.union([t.null, t.string]), // timestamp with time zone nullable: YES
  refresh_token: t.string, // character varying nullable: NO
  user_id: t.number, // integer nullable: NO
  updated_at: t.union([t.null, t.string]), // timestamp with time zone nullable: YES
})

export type IRefreshTokensEntity = t.TypeOf<typeof RefreshTokensEntityContract>

export enum RefreshTokensProps {
  Id = 'id',
  CreatedAt = 'created_at',
  RefreshToken = 'refresh_token',
  UserId = 'user_id',
  UpdatedAt = 'updated_at',
}
