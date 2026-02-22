import React, { useCallback, useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { MdRotateLeft, MdRotateRight } from 'react-icons/md'
import { useTranslation } from '../../../contexts/TranslationProvider'
import Button from '../../../components/Button/Button'
import './ImageEditor.scss'

const RESIZE_OPTIONS = [50, 75, 100, 125, 150, 200]

function getCroppedImg (image, crop, rotation = 0, resizePercent = 100) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY
    const cropW = crop.width * scaleX
    const cropH = crop.height * scaleY

    canvas.width = cropW
    canvas.height = cropH
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    const normalizedRotation = ((rotation % 360) + 360) % 360
    const is90or270 = normalizedRotation === 90 || normalizedRotation === 270
    const resultW = is90or270 ? cropH : cropW
    const resultH = is90or270 ? cropW : cropH

    const rotatedCanvas = document.createElement('canvas')
    rotatedCanvas.width = resultW
    rotatedCanvas.height = resultH
    const rotCtx = rotatedCanvas.getContext('2d')
    if (!rotCtx) {
      reject(new Error('Canvas not supported'))
      return
    }
    rotCtx.save()
    if (normalizedRotation === 90) {
      rotCtx.translate(cropH, 0)
      rotCtx.rotate(Math.PI / 2)
      rotCtx.drawImage(canvas, 0, 0, cropW, cropH, 0, -cropH, cropW, cropH)
    } else if (normalizedRotation === 180) {
      rotCtx.translate(cropW, cropH)
      rotCtx.rotate(Math.PI)
      rotCtx.drawImage(canvas, 0, 0, cropW, cropH, -cropW, -cropH, cropW, cropH)
    } else if (normalizedRotation === 270) {
      rotCtx.translate(0, cropW)
      rotCtx.rotate(-Math.PI / 2)
      rotCtx.drawImage(canvas, 0, 0, cropW, cropH, -cropW, 0, cropW, cropH)
    } else {
      rotCtx.drawImage(canvas, 0, 0, cropW, cropH, 0, 0, cropW, cropH)
    }
    rotCtx.restore()

    const finalW = Math.round(resultW * (resizePercent / 100))
    const finalH = Math.round(resultH * (resizePercent / 100))
    const outCanvas = document.createElement('canvas')
    outCanvas.width = finalW
    outCanvas.height = finalH
    const outCtx = outCanvas.getContext('2d')
    if (!outCtx) {
      reject(new Error('Canvas not supported'))
      return
    }
    outCtx.drawImage(rotatedCanvas, 0, 0, resultW, resultH, 0, 0, finalW, finalH)

    outCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      'image/png',
      0.95
    )
  })
}

function ImageEditor ({ src, fileName, onApply, onCancel }) {
  const [crop, setCrop] = useState({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [resizePercent, setResizePercent] = useState(100)
  const [isApplying, setIsApplying] = useState(false)
  const imgRef = useRef(null)
  const t = useTranslation()

  const handleImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget
    setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
    setCompletedCrop({ unit: 'px', x: 0, y: 0, width, height })
  }, [])

  const handleApply = useCallback(async () => {
    if (!imgRef.current) return
    const cropToUse = completedCrop || {
      x: 0,
      y: 0,
      width: imgRef.current.width,
      height: imgRef.current.height
    }
    setIsApplying(true)
    try {
      const blob = await getCroppedImg(imgRef.current, cropToUse, rotation, resizePercent)
      onApply?.(blob, fileName)
    } catch (err) {
      console.error('Image edit failed:', err)
    } finally {
      setIsApplying(false)
    }
  }, [completedCrop, rotation, resizePercent, fileName, onApply])

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90) % 360)
  }, [])

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360)
  }, [])

  return (
    <div className="image-editor">
      <div className="image-editor-canvas">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={undefined}
          className="image-editor-crop"
        >
          <img
            ref={imgRef}
            src={src}
            alt="Edit"
            onLoad={handleImageLoad}
          />
        </ReactCrop>
      </div>
      <div className="image-editor-toolbar">
        <div className="image-editor-actions">
          <button
            type="button"
            className="image-editor-btn"
            onClick={handleRotateLeft}
            title={t('rotateLeft')}
            aria-label={t('rotateLeft')}
          >
            <MdRotateLeft size={20} />
            <span>{t('rotateLeft')}</span>
          </button>
          <button
            type="button"
            className="image-editor-btn"
            onClick={handleRotateRight}
            title={t('rotateRight')}
            aria-label={t('rotateRight')}
          >
            <MdRotateRight size={20} />
            <span>{t('rotateRight')}</span>
          </button>
          <div className="image-editor-resize">
            <label htmlFor="resize-select">{t('resize')}:</label>
            <select
              id="resize-select"
              value={resizePercent}
              onChange={(e) => setResizePercent(Number(e.target.value))}
              className="image-editor-select"
            >
              {RESIZE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="image-editor-buttons">
          <Button onClick={onCancel} padding="0.4rem 0.9rem" disabled={isApplying}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply} padding="0.4rem 0.9rem" disabled={isApplying}>
            {isApplying ? t('applying') : t('apply')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageEditor
