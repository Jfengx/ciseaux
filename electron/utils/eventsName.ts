export const OPEN_FILE = Symbol('open-file')
export const DROP_FILE = Symbol('drop-file')
export const PROCESS_END = Symbol('process-end')

export const events = {
  [OPEN_FILE]: 'open-file',
  [DROP_FILE]: 'drop-file',
  [PROCESS_END]: 'process-end',
}
