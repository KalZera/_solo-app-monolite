import { Input, styled } from 'tamagui'

export const SystemInput = styled(Input, {
  backgroundColor: '$soloPanelAlt',
  borderColor: '$soloBorder',
  borderWidth: 1,
  borderRadius: '$4',
  color: '$soloText',
  placeholderTextColor: '$soloTextMuted',
  paddingHorizontal: '$3',
  height: 48,

  focusStyle: {
    borderColor: '$soloCyan',
  },
})
