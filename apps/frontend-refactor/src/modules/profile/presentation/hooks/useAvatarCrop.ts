/* eslint-disable react-hooks/refs -- PanResponder is imperative: the latest-value
   refs below are written in effects and read only inside gesture callbacks, never
   during render. This is the standard React Native pan/zoom pattern. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { PanResponder } from 'react-native'
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { useTranslation } from 'react-i18next'
import { useNotify } from '@/shared/notifications/useNotify'
import {
  MAX_SCALE,
  MIN_SCALE,
  OUTPUT_SIZE,
  baseScaleFor,
  clampTranslate,
  computeCropRegion,
  type Offset,
  type PickedImage,
} from '../../domain/crop'
import { useUploadAvatar } from '../../application/useUploadAvatar'

/** Owns all avatar picking, pan/zoom gesture state, cropping and upload. */
export function useAvatarCrop() {
  const { t } = useTranslation()
  const { error: notifyError } = useNotify()
  const upload = useUploadAvatar()

  const [image, setImage] = useState<PickedImage | null>(null)
  const [scale, setScale] = useState(MIN_SCALE)
  const [translate, setTranslate] = useState<Offset>({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)

  // Latest-value refs let the once-created PanResponder read fresh state inside
  // its gesture callbacks (which never run during render).
  const scaleRef = useRef(scale)
  const translateRef = useRef(translate)
  const imageRef = useRef(image)
  const panStart = useRef<Offset>({ x: 0, y: 0 })

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])
  useEffect(() => {
    translateRef.current = translate
  }, [translate])
  useEffect(() => {
    imageRef.current = image
  }, [image])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          panStart.current = translateRef.current
        },
        onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          const current = imageRef.current
          if (!current) return
          setTranslate(
            clampTranslate(
              { x: panStart.current.x + gesture.dx, y: panStart.current.y + gesture.dy },
              scaleRef.current,
              current,
            ),
          )
        },
      }),
    [],
  )

  function applyPicked(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset?.width || !asset.height) {
      notifyError(t('profile.avatar.errorTitle'), t('profile.avatar.pickError'))
      return
    }
    setImage({ uri: asset.uri, width: asset.width, height: asset.height })
    setScale(MIN_SCALE)
    setTranslate({ x: 0, y: 0 })
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      notifyError(t('profile.avatar.errorTitle'), t('profile.avatar.libraryPermissionDenied'))
      return
    }
    applyPicked(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 }))
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      notifyError(t('profile.avatar.errorTitle'), t('profile.avatar.cameraPermissionDenied'))
      return
    }
    applyPicked(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }))
  }

  function adjustZoom(delta: number) {
    if (!image) return
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta))
    setScale(next)
    setTranslate((previous) => clampTranslate(previous, next, image))
  }

  async function confirm() {
    if (!image) return
    setIsCropping(true)
    try {
      const region = computeCropRegion(image, scale, translate)
      const result = await manipulateAsync(
        image.uri,
        [{ crop: region }, { resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } }],
        { compress: 0.9, format: SaveFormat.JPEG },
      )
      await upload.mutateAsync(result.uri)
    } catch {
      notifyError(t('profile.avatar.errorTitle'), t('profile.avatar.cropError'))
    } finally {
      setIsCropping(false)
    }
  }

  const previewStyle = useMemo(() => {
    if (!image) return undefined
    const displayScale = baseScaleFor(image) * scale
    return {
      width: image.width * displayScale,
      height: image.height * displayScale,
      transform: [{ translateX: translate.x }, { translateY: translate.y }],
    }
  }, [image, scale, translate])

  return {
    image,
    isBusy: isCropping || upload.isPending,
    panHandlers: image ? panResponder.panHandlers : {},
    previewStyle,
    pickFromLibrary,
    takePhoto,
    adjustZoom,
    confirm,
    canZoomIn: scale < MAX_SCALE,
    canZoomOut: scale > MIN_SCALE,
  }
}
