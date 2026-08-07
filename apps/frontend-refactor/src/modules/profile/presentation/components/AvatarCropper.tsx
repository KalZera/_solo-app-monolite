import { Image as RNImage, Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Text } from '@/shared/components'
import { Camera, Check, Images, User, ZoomIn, ZoomOut } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { VIEWPORT_SIZE, ZOOM_STEP } from '../../domain/crop'
import { useAvatarCrop } from '../hooks/useAvatarCrop'

export function AvatarCropper() {
  const { t } = useTranslation()
  const crop = useAvatarCrop()

  return (
    <Panel className="items-center gap-4">
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border-2 border-primary bg-surface-raised"
        style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
        {...crop.panHandlers}
      >
        {crop.image ? (
          <RNImage source={{ uri: crop.image.uri }} style={crop.previewStyle} resizeMode="cover" />
        ) : (
          <User size={64} color={colors.contentMuted} />
        )}
      </View>

      <Text className="text-center text-xs text-content-muted">
        {crop.image ? t('profile.avatar.cropHint') : t('profile.avatar.editHint')}
      </Text>

      {crop.image ? (
        <View className="flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.avatar.zoomOut')}
            disabled={crop.isBusy || !crop.canZoomOut}
            onPress={() => crop.adjustZoom(-ZOOM_STEP)}
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40"
          >
            <ZoomOut size={18} color={colors.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.avatar.zoomIn')}
            disabled={crop.isBusy || !crop.canZoomIn}
            onPress={() => crop.adjustZoom(ZOOM_STEP)}
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40"
          >
            <ZoomIn size={18} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}

      <View className="w-full flex-row gap-3">
        <Button
          label={
            crop.image ? t('profile.avatar.changePhoto') : t('profile.avatar.chooseFromLibrary')
          }
          variant="secondary"
          size="md"
          fullWidth={false}
          className="flex-1"
          icon={<Images size={16} color={colors.primary} />}
          disabled={crop.isBusy}
          onPress={crop.pickFromLibrary}
        />
        <Button
          label={t('profile.avatar.takePhoto')}
          variant="secondary"
          size="md"
          fullWidth={false}
          className="flex-1"
          icon={<Camera size={16} color={colors.primary} />}
          disabled={crop.isBusy}
          onPress={crop.takePhoto}
        />
      </View>

      {crop.image ? (
        <Button
          label={crop.isBusy ? t('profile.avatar.confirming') : t('profile.avatar.confirm')}
          loading={crop.isBusy}
          icon={<Check size={16} color={colors.backdrop.bottom} />}
          onPress={crop.confirm}
        />
      ) : null}
    </Panel>
  )
}
