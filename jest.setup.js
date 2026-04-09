const { TextDecoder, TextEncoder } = require('util')
const { MessageChannel } = require('worker_threads')

global.IS_REACT_ACT_ENVIRONMENT = true

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = MessageChannel
}

// Polyfill for structuredClone in test environment
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    // A simple polyfill, for more complex objects a library might be needed
    return JSON.parse(JSON.stringify(obj))
  }
}

// Polyfill for crypto.randomUUID
if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID === 'undefined') {
  global.crypto = {
    ...global.crypto,
    randomUUID: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }),
  }
}
