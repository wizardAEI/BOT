import { createAvatar } from '@dicebear/core'
import { botttsNeutral } from '@dicebear/collection'
import { createMemo } from 'solid-js'

export default function BotIcon(props: { size: number; seed: string }) {
  const avatar = createMemo(() => {
    const avatar = createAvatar(botttsNeutral, {
      seed: props.seed,
      size: props.size,
      radius: 50,
      backgroundType: ['gradientLinear', 'solid']
    })
    return avatar.toDataUri()
  })

  // eslint-disable-next-line solid/no-innerhtml
  return <img src={avatar()} alt="Bot icon" width={props.size} height={props.size} />
}
