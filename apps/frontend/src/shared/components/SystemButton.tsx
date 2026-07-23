import { Button, styled } from 'tamagui'

export const SystemButton = styled(Button, {
  backgroundColor: '$soloBlue',
  borderColor: '$soloCyan',
  borderWidth: 1,
  borderRadius: '$4',
  color: '$soloBg',
  fontWeight: '700',
  letterSpacing: 1,

  pressStyle: {
    backgroundColor: '$soloBluePress',
  },
  hoverStyle: {
    backgroundColor: '$soloBlueHover',
  },
  disabledStyle: {
    opacity: 0.5,
  },
})
