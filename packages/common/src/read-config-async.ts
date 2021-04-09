import * as slugify from '@sindresorhus/slugify'
import { pathExists } from 'fs-extra'
import { join } from 'path'

import { constants } from './constants'
import {
  Config,
  ConfigCommand,
  ConfigFile,
  ConfigRelaunchButton
} from './types/config'
import {
  RawConfig,
  RawConfigCommand,
  RawConfigCommandSeparator,
  RawConfigFile,
  RawConfigRelaunchButtons
} from './types/raw-config'

const defaultConfig: Config = {
  apiVersion: constants.apiVersion,
  commandId: 'main.ts--default',
  id: constants.packageJson.defaultPluginName,
  main: { handler: 'default', src: join(constants.src.directory, 'main.ts') },
  menu: null,
  name: constants.packageJson.defaultPluginName,
  relaunchButtons: null,
  ui: null
}

export async function readConfigAsync(): Promise<Config> {
  const packageJsonPath = join(process.cwd(), 'package.json')
  if ((await pathExists(packageJsonPath)) === false) {
    return defaultConfig
  }
  const packageJson = require(packageJsonPath)
  const config: RawConfig = packageJson[constants.packageJson.configKey]
  if (typeof config === 'undefined' || Object.keys(config).length === 0) {
    return defaultConfig
  }
  const { apiVersion, id, name, main, ui, menu, relaunchButtons } = config
  return {
    apiVersion:
      typeof apiVersion === 'undefined' ? constants.apiVersion : apiVersion,
    id: typeof id === 'undefined' ? slugify(name) : id,
    ...parseCommand({ main, menu, name, ui }),
    relaunchButtons:
      typeof relaunchButtons === 'undefined'
        ? null
        : parseRelaunchButtons(relaunchButtons)
  }
}

function parseCommand(command: RawConfigCommand): ConfigCommand {
  const { name, main, ui, menu } = command
  return {
    commandId: typeof main === 'undefined' ? null : parseCommandId(main),
    main: typeof main === 'undefined' ? null : parseFile(main),
    menu:
      typeof menu === 'undefined'
        ? null
        : menu.map(function (
            command: RawConfigCommand | RawConfigCommandSeparator
          ) {
            if (command === '-') {
              return { separator: true }
            }
            return parseCommand(command)
          }),
    name,
    ui: typeof ui === 'undefined' ? null : parseFile(ui)
  }
}

function parseRelaunchButtons(
  relaunchButtons: RawConfigRelaunchButtons
): Array<ConfigRelaunchButton> {
  const result = []
  for (const commandId in relaunchButtons) {
    const { name, main, ui, multipleSelection } = relaunchButtons[commandId]
    if (typeof main === 'undefined') {
      throw new Error(`Need a "main" for relaunch button: ${name}`)
    }
    result.push({
      commandId,
      main: parseFile(main),
      multipleSelection:
        typeof multipleSelection === 'undefined' ? false : multipleSelection,
      name,
      ui: typeof ui === 'undefined' ? null : parseFile(ui)
    })
  }
  return result
}

function parseCommandId(main: RawConfigFile): string {
  if (typeof main === 'string') {
    return `${main}--default`
  }
  const { src, handler } = main
  if (typeof handler === 'undefined') {
    return `${src}--default`
  }
  return `${src}--${handler}`
}

function parseFile(file: RawConfigFile): ConfigFile {
  if (typeof file === 'string') {
    return {
      handler: 'default',
      src: file
    }
  }
  const { src, handler } = file
  if (typeof handler === 'undefined') {
    return {
      handler: 'default',
      src
    }
  }
  return { handler, src }
}
