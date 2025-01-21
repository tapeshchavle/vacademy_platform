// import { Capacitor } from '@capacitor/core'
// import { App } from '@capacitor/app'
// import { Preferences } from '@capacitor/preferences'

// export const isNative = Capacitor.isNativePlatform()

// export const disableBackButton = async () => {
//   if (isNative) {
//     await App.addListener('backButton', (data) => {
//       data.canGoBack = false
//     })
//   }
// }

// export const saveResponse = async (questionId: string, optionId: string) => {
//   if (isNative) {
//     await Preferences.set({
//       key: `response_${questionId}`,
//       value: optionId,
//     })
//   } else {
//     localStorage.setItem(`response_${questionId}`, optionId)
//   }
// }

// export const getResponse = async (questionId: string) => {
//   if (isNative) {
//     const { value } = await Preferences.get({ key: `response_${questionId}` })
//     return value
//   } else {
//     return localStorage.getItem(`response_${questionId}`)
//   }
// }




import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Preferences } from '@capacitor/preferences'

export const isNative = Capacitor.isNativePlatform()

export const disableBackButton = async () => {
  if (isNative) {
    await App.addListener('backButton', (data) => {
      data.canGoBack = false
    })
  }
}

export const saveResponse = async (questionId: string, optionIds: string[], questionType: string) => {
  try {
    const existingData = await Preferences.get({ key: 'assessmentData' })
    let data = existingData.value ? JSON.parse(existingData.value) : { response: [], testDuration: {} }

    const existingResponseIndex = data.response.findIndex(
      (item: any) => item.MarkedResponse.questionId === questionId
    )

    const newResponse = {
      MarkedResponse: {
        questionId,
        correctOptionsIds: {
          questionType,
          optionIds
        }
      }
    }

    if (existingResponseIndex !== -1) {
      data.response[existingResponseIndex] = newResponse
    } else {
      data.response.push(newResponse)
    }

    await Preferences.set({
      key: 'assessmentData',
      value: JSON.stringify(data)
    })
  } catch (error) {
    console.error('Error saving response:', error)
  }
}

export const getResponse = async (questionId: string) => {
  try {
    const { value } = await Preferences.get({ key: 'assessmentData' })
    if (value) {
      const data = JSON.parse(value)
      const response = data.response.find(
        (item: any) => item.MarkedResponse.questionId === questionId
      )
      return response ? response.MarkedResponse.correctOptionsIds.optionIds : null
    }
    return null
  } catch (error) {
    console.error('Error getting response:', error)
    return null
  }
}


export const saveTestDuration = async (duration: {
  entireTestDurationLeft: string,
  sectionWiseDurationLeft: string,
  questionWiseDurationLeft: string
}) => {
  try {
    const existingData = await Preferences.get({ key: 'assessmentData' })
    let data = existingData.value ? JSON.parse(existingData.value) : { response: [], testDuration: {} }
    
    data.testDuration = duration

    await Preferences.set({
      key: 'assessmentData',
      value: JSON.stringify(data)
    })
  } catch (error) {
    console.error('Error saving test duration:', error)
  }
}

export const getTestDuration = async () => {
  try {
    const { value } = await Preferences.get({ key: 'assessmentData' })
    if (value) {
      const data = JSON.parse(value)
      return data.testDuration
    }
    return null
  } catch (error) {
    console.error('Error getting test duration:', error)
    return null
  }
}

