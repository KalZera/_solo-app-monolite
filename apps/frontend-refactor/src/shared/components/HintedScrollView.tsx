import { useRef, useState, type ReactNode } from 'react'
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { ScrollHint } from './ScrollHint'

// Slack (px) before we consider the user to have reached the very bottom.
const AT_BOTTOM_THRESHOLD = 8

interface HintedScrollViewProps {
  children: ReactNode
  /** Applied to the inner ScrollView — typically a `maxHeight` to cap the scroll area. */
  style?: StyleProp<ViewStyle>
}

/**
 * ScrollView that overlays a pulsing "more below" {@link ScrollHint} whenever its content overflows
 * and the user hasn't scrolled to the end. The hint disappears at the bottom (and when nothing
 * overflows at all). Measurements live in refs so scrolling never re-renders; only the derived
 * `showHint` boolean is state, and it flips at most twice per scroll.
 */
export function HintedScrollView({ children, style }: HintedScrollViewProps) {
  const viewportHeight = useRef(0)
  const contentHeight = useRef(0)
  const scrollOffset = useRef(0)
  const [showHint, setShowHint] = useState(false)

  function syncHint() {
    const overflow = contentHeight.current - viewportHeight.current
    const distanceToBottom = overflow - scrollOffset.current
    const next = overflow > 4 && distanceToBottom > AT_BOTTOM_THRESHOLD
    setShowHint((prev) => (prev === next ? prev : next))
  }

  function handleLayout(event: LayoutChangeEvent) {
    viewportHeight.current = event.nativeEvent.layout.height
    syncHint()
  }

  function handleContentSizeChange(_width: number, measuredHeight: number) {
    contentHeight.current = measuredHeight
    syncHint()
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollOffset.current = event.nativeEvent.contentOffset.y
    syncHint()
  }

  return (
    <View className="relative">
      <ScrollView
        style={style}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
      >
        {children}
      </ScrollView>

      {showHint ? (
        <View
          className="absolute inset-x-0 bottom-1.5 items-center"
          style={{ pointerEvents: 'none' }}
        >
          <ScrollHint />
        </View>
      ) : null}
    </View>
  )
}
