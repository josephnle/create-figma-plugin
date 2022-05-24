/** @jsx h */
import { h } from 'preact'

import { Text } from '../../text/text'
import { Link } from '../link'

export default {
  parameters: {
    fixedWidth: true
  },
  title: 'Components/Link'
}

export const Default = function () {
  return (
    <Text>
      <Link href="https://figma.com">Link</Link>
    </Text>
  )
}

export const NewWindow = function () {
  return (
    <Text>
      <Link href="https://figma.com" target="_blank">
        Link
      </Link>
    </Text>
  )
}

export const FullWidth = function () {
  const style = { backgroundColor: 'var(--figma-color-bg-brand-tertiary)' }
  return (
    <div style={style}>
      <Text>
        <Link fullWidth href="https://figma.com">
          Link
        </Link>
      </Text>
    </div>
  )
}
