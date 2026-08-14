import { Fragment } from 'react'
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen, ScreenHeader, Text, Button } from '@/shared/components'
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Crop,
  Images,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { cn } from '@/shared/utils/cn'
import { ZOOM_STEP } from '../../domain/crop'
import { AvatarRing } from '../components/AvatarRing'
import { useAvatarCrop } from '../hooks/useAvatarCrop'

const STEPS: { key: string; Icon: LucideIcon }[] = [
  { key: 'choose', Icon: Images },
  { key: 'adjust', Icon: Crop },
  { key: 'done', Icon: CheckCircle2 },
]

const GLOW = {
  shadowColor: colors.primary,
  shadowOpacity: 0.6,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
}

/** Small blue bar + uppercase label used for the card's section titles. */
function SectionBar({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-4 w-1 rounded-full bg-primary" />
      <Text weight="bold" className="text-sm uppercase tracking-[3px] text-content">
        {label}
      </Text>
    </View>
  )
}

interface ActionButtonProps {
  label: string
  icon: LucideIcon
  onPress: () => void
  solid?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
}

/** Outlined (default) or solid-glow action button matching the mockup. */
function ActionButton({
  label,
  icon: Icon,
  onPress,
  solid = false,
  disabled = false,
  loading = false,
  className,
}: ActionButtonProps) {
  const busy = disabled || loading
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl border py-4',
        solid
          ? 'border-primary bg-primary active:opacity-90'
          : 'border-primary/30 bg-surface/40 active:bg-surface-raised',
        className,
      )}
      style={solid ? { ...GLOW, opacity: busy ? 0.6 : 1 } : { opacity: busy ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color={solid ? colors.content : colors.primary} />
      ) : (
        <Icon size={18} color={solid ? colors.content : colors.primary} />
      )}
      <Text weight="bold" className="text-xs uppercase tracking-[1.5px] text-content">
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * "Edit Avatar" — a faithful build of the avatar-edit mockup. Starts on the landing (placeholder +
 * how-it-works); once an image is chosen (picked, or passed via the `image` route param) it becomes
 * an adjust step where the ring is a draggable/zoomable crop area before saving.
 */
export function AvatarEditScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { imageParam } = useLocalSearchParams<{ imageParam?: string }>()
  const disc = Math.min(Math.round(width * 0.6), 250)
  const crop = useAvatarCrop(imageParam, disc)
  const editing = !!crop.image

  return (
    <Screen scroll>
      <ScreenHeader
        eyebrow={t('common.systemLabel')}
        title={t('profile.avatar.title')}
        titleClassName="uppercase"
        subtitle={t('profile.avatar.heroSubtitle')}
        onBack={() => router.push('/profile')}
      />

      <View
        className="gap-5 rounded-3xl border border-primary/25 bg-surface/40 p-5"
        style={{
          shadowColor: colors.primary,
          shadowOpacity: 0.18,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }}
      >
        {/* Avatar preview / crop area */}
        <SectionBar label={t('profile.avatar.sectionAvatar')} />

        <View className="items-center gap-4">
          <AvatarRing
            className={editing ? 'cursor-pointer' : ''}
            disc={disc}
            uri={crop.image?.uri}
            previewStyle={crop.previewStyle}
            panHandlers={crop.panHandlers}
            onEditPress={crop.pickFromLibrary}
          />
          <Text className="text-center text-sm text-content-muted">
            {editing ? t('profile.avatar.cropHint') : t('profile.avatar.editHint')}
          </Text>

          {editing ? (
            <View className="flex-row gap-3 flex-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.avatar.zoomOut')}
                disabled={crop.isBusy || !crop.canZoomOut}
                onPress={() => crop.adjustZoom(-ZOOM_STEP)}
                className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
                style={{ opacity: crop.isBusy || !crop.canZoomOut ? 0.4 : 1 }}
              >
                <ZoomOut size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.avatar.zoomIn')}
                disabled={crop.isBusy || !crop.canZoomIn}
                onPress={() => crop.adjustZoom(ZOOM_STEP)}
                className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
                style={{ opacity: crop.isBusy || !crop.canZoomIn ? 0.4 : 1 }}
              >
                <ZoomIn size={18} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Onboarding content — only on the landing (no image yet) */}
        {editing ? null : (
          <>
            <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface/40 p-4">
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={20} color={colors.primary} />
                <Text weight="bold" className="text-xs uppercase tracking-[2px] text-primary">
                  {t('profile.avatar.tipLabel')}
                </Text>
              </View>
              <View className="h-8 w-px bg-line" />
              <Text className="flex-1 text-xs leading-5 text-content-muted">
                {t('profile.avatar.tipText')}
              </Text>
            </View>

            <View className="h-px bg-line" />

            <SectionBar label={t('profile.avatar.howItWorks')} />

            <View className="flex-row items-start">
              {STEPS.map(({ key, Icon }, index) => (
                <Fragment key={key}>
                  {index > 0 ? (
                    <View style={{ marginTop: 18, opacity: 0.5 }}>
                      <ChevronRight size={18} color={colors.primary} />
                    </View>
                  ) : null}
                  <View className="flex-1 items-center gap-2">
                    <View className="h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/5">
                      <Icon size={22} color={colors.primary} />
                    </View>
                    <Text weight="semibold" className="text-center text-sm text-primary">
                      {t(`profile.avatar.steps.${key}.title`)}
                    </Text>
                    <Text className="text-center text-[11px] leading-4 text-content-muted">
                      {t(`profile.avatar.steps.${key}.description`)}
                    </Text>
                  </View>
                </Fragment>
              ))}
            </View>
          </>
        )}

        {/* Pick actions */}
        <View className="flex-row gap-3">
          <Button
            className="flex-1 bg-surface/40 active:bg-surface-raised"
            classNameLabel="text-xs uppercase tracking-[1.5px] text-content"
            icon={<Images size={18} color={colors.primary} />}
            label={t('profile.avatar.chooseFromLibrary')}
            disabled={crop.isBusy}
            onPress={crop.pickFromLibrary}
            variant="primary"
          />
          <Button
            className="flex-1 bg-surface/40 active:bg-surface-raised"
            classNameLabel="text-xs uppercase tracking-[1.5px] text-content"
            icon={<Camera size={18} color={colors.primary} />}
            label={t('profile.avatar.takePhoto')}
            disabled={crop.isBusy}
            onPress={crop.takePhoto}
          />
        </View>

        {/* Save — only once an image is chosen */}
        {editing ? (
          <Button
            className="flex-1 bg-primary/20 active:opacity-90"
            classNameLabel="text-xs uppercase tracking-[1.5px] text-content"
            icon={<Check size={18} color={colors.content} />}
            label={crop.isBusy ? t('profile.avatar.confirming') : t('profile.avatar.confirm')}
            loading={crop.isBusy}
            onPress={crop.confirm}
          />
        ) : null}
      </View>
    </Screen>
  )
}
