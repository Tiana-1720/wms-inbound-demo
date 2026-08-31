import type { ThHTMLAttributes, MouseEvent as ReactMouseEvent } from 'react'

type ResizableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  width?: number
  onResize?: (width: number) => void
}

/** Demo PRD §1.5：列宽拖拽。表头右侧拖动手柄，不改表格视觉皮肤。 */
export function ResizableHeaderCell({
  width,
  onResize,
  children,
  style,
  ...rest
}: ResizableHeaderCellProps) {
  const handleMouseDown = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (!onResize || !width) return
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = width

    const onMove = (moveEvent: MouseEvent) => {
      onResize(Math.max(64, startWidth + moveEvent.clientX - startX))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <th {...rest} style={{ ...style, width, position: 'relative' }}>
      {children}
      {onResize ? (
        <span
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 6,
            cursor: 'col-resize',
          }}
        />
      ) : null}
    </th>
  )
}
