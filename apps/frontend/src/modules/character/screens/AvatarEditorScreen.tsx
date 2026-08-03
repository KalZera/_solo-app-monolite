import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Check,
  ChevronLeft,
  Images,
  User,
  ZoomIn,
  ZoomOut,
} from "@tamagui/lucide-icons-2";
import { Image as RNImage, PanResponder } from "react-native";
import type {
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";
import { SystemPanel } from "@/shared/components/SystemPanel";
import { useAppToast } from "@/shared/notifications/useAppToast";
import { useUploadCharacterAvatar } from "../api/useUploadCharacterAvatar";

const VIEWPORT_SIZE = 280;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.25;
const OUTPUT_SIZE = 512;

interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

interface Offset {
  x: number;
  y: number;
}

function baseScaleFor(image: PickedImage): number {
  return VIEWPORT_SIZE / Math.min(image.width, image.height);
}

function clampTranslate(
  candidate: Offset,
  userScale: number,
  image: PickedImage,
): Offset {
  const displayScale = baseScaleFor(image) * userScale;
  const maxX = Math.max(0, (image.width * displayScale - VIEWPORT_SIZE) / 2);
  const maxY = Math.max(0, (image.height * displayScale - VIEWPORT_SIZE) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, candidate.x)),
    y: Math.min(maxY, Math.max(-maxY, candidate.y)),
  };
}

export function AvatarEditorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showError } = useAppToast();
  const uploadAvatar = useUploadCharacterAvatar();

  const [image, setImage] = useState<PickedImage | null>(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [translate, setTranslateState] = useState<Offset>({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);

  const scaleRef = useRef(scale);
  const translateRef = useRef(translate);
  const imageRef = useRef(image);
  scaleRef.current = scale;
  translateRef.current = translate;
  imageRef.current = image;

  const panStart = useRef<Offset>({ x: 0, y: 0 });

  function setTranslate(next: Offset) {
    translateRef.current = next;
    setTranslateState(next);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        panStart.current = translateRef.current;
      },
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        const current = imageRef.current;
        if (!current) return;
        setTranslate(
          clampTranslate(
            {
              x: panStart.current.x + gesture.dx,
              y: panStart.current.y + gesture.dy,
            },
            scaleRef.current,
            current,
          ),
        );
      },
    }),
  ).current;

  function applyPickedAsset(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.width || !asset.height) {
      showError(
        t("character.avatarEditor.toastErrorTitle"),
        t("character.avatarEditor.pickError"),
      );
      return;
    }

    setImage({ uri: asset.uri, width: asset.width, height: asset.height });
    setScale(MIN_SCALE);
    setTranslate({ x: 0, y: 0 });
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError(
        t("character.avatarEditor.toastErrorTitle"),
        t("character.avatarEditor.libraryPermissionDenied"),
      );
      return;
    }

    applyPickedAsset(
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      }),
    );
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showError(
        t("character.avatarEditor.toastErrorTitle"),
        t("character.avatarEditor.cameraPermissionDenied"),
      );
      return;
    }

    applyPickedAsset(
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      }),
    );
  }

  function adjustZoom(delta: number) {
    if (!image) return;
    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, scaleRef.current + delta),
    );
    setScale(nextScale);
    setTranslate(clampTranslate(translateRef.current, nextScale, image));
  }

  async function handleConfirm() {
    if (!image) return;

    setIsCropping(true);
    try {
      const displayScale = baseScaleFor(image) * scale;
      const cropSize = VIEWPORT_SIZE / displayScale;
      const originX =
        image.width / 2 -
        VIEWPORT_SIZE / (2 * displayScale) -
        translate.x / displayScale;
      const originY =
        image.height / 2 -
        VIEWPORT_SIZE / (2 * displayScale) -
        translate.y / displayScale;

      const result = await manipulateAsync(
        image.uri,
        [
          {
            crop: {
              originX: Math.max(0, Math.round(originX)),
              originY: Math.max(0, Math.round(originY)),
              width: Math.round(cropSize),
              height: Math.round(cropSize),
            },
          },
          { resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } },
        ],
        { compress: 0.9, format: SaveFormat.JPEG },
      );

      await uploadAvatar.mutateAsync(result.uri);
      router.back();
    } catch {
      showError(
        t("character.avatarEditor.toastErrorTitle"),
        t("character.avatarEditor.cropError"),
      );
    } finally {
      setIsCropping(false);
    }
  }

  const isBusy = isCropping || uploadAvatar.isPending;

  const previewStyle = useMemo(() => {
    if (!image) return undefined;
    const displayScale = baseScaleFor(image) * scale;
    return {
      width: image.width * displayScale,
      height: image.height * displayScale,
      transform: [{ translateX: translate.x }, { translateY: translate.y }],
    };
  }, [image, scale, translate]);

  return (
    <YStack
      flex={1}
      backgroundColor="$soloBg"
      padding="$4"
      paddingTop="$7"
      gap="$5"
      alignItems="center"
    >
      <XStack width="100%" maxWidth={420} alignItems="center" gap="$3">
        <Button
          chromeless
          circular
          size="$3"
          icon={<ChevronLeft color="$soloText" size={22} />}
          onPress={() => router.back()}
        />
        <Text
          color="$soloCyan"
          fontSize="$3"
          letterSpacing={4}
          textTransform="uppercase"
        >
          {t("character.avatarEditor.title")}
        </Text>
      </XStack>

      <SystemPanel width="100%" maxWidth={420} alignItems="center" gap="$4">
        <View
          width={VIEWPORT_SIZE}
          height={VIEWPORT_SIZE}
          borderRadius="$4"
          borderWidth={2}
          borderColor="$soloCyan"
          overflow="hidden"
          backgroundColor="$soloPanelAlt"
          alignItems="center"
          justifyContent="center"
          {...(image ? panResponder.panHandlers : {})}
        >
          {image ? (
            <RNImage
              source={{ uri: image.uri }}
              style={previewStyle}
              resizeMode="cover"
            />
          ) : (
            <User color="$soloTextMuted" size={64} />
          )}
        </View>

        <Text color="$soloTextMuted" fontSize="$2" textAlign="center">
          {image
            ? t("character.avatarEditor.cropHint")
            : t("character.avatarEditor.editHint")}
        </Text>

        {image && (
          <XStack gap="$3">
            <Button
              size="$3"
              circular
              chromeless
              borderWidth={1}
              borderColor="$soloBorderStrong"
              backgroundColor="$soloPanelAlt"
              icon={<ZoomOut color="$soloCyan" size={16} />}
              disabled={isBusy || scale <= MIN_SCALE}
              onPress={() => adjustZoom(-ZOOM_STEP)}
            />
            <Button
              size="$3"
              circular
              chromeless
              borderWidth={1}
              borderColor="$soloBorderStrong"
              backgroundColor="$soloPanelAlt"
              icon={<ZoomIn color="$soloCyan" size={16} />}
              disabled={isBusy || scale >= MAX_SCALE}
              onPress={() => adjustZoom(ZOOM_STEP)}
            />
          </XStack>
        )}

        <XStack gap="$3" width="100%">
          <Button
            flex={1}
            chromeless
            borderWidth={1}
            borderColor="$soloBorderStrong"
            backgroundColor="$soloPanelAlt"
            color="$soloText"
            icon={<Images color="$soloCyan" size={16} />}
            disabled={isBusy}
            onPress={pickFromLibrary}
          >
            {image
              ? t("character.avatarEditor.changePhoto")
              : t("character.avatarEditor.chooseFromLibrary")}
          </Button>
          <Button
            flex={1}
            chromeless
            borderWidth={1}
            borderColor="$soloBorderStrong"
            backgroundColor="$soloPanelAlt"
            color="$soloText"
            icon={<Camera color="$soloCyan" size={16} />}
            disabled={isBusy}
            onPress={takePhoto}
          >
            {t("character.avatarEditor.takePhoto")}
          </Button>
        </XStack>

        {image && (
          <SystemButton
            width="100%"
            icon={isBusy ? undefined : <Check color="$soloBg" size={16} />}
            disabled={isBusy}
            onPress={handleConfirm}
          >
            {isBusy
              ? t("character.avatarEditor.confirming")
              : t("character.avatarEditor.confirm")}
          </SystemButton>
        )}
      </SystemPanel>
    </YStack>
  );
}
