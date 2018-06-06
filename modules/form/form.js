import { createAction } from 'redux-act'
import { Map } from 'immutable'
import { createSelector } from 'reselect'

import { pipe, branchIf } from 'lib/utils'

// CONSTANTS
const MODULE_NAME = '[FORM]'
const generateInputValuePath = basePath => [...basePath, 'value']
const generateInputIsFocusPath = basePath => [...basePath, 'isFocused']
const generateInputIsTouchedPath = basePath => [...basePath, 'isTouched']
const generateInputIsErrorShownPath = basePath => [...basePath, 'isErrorShown']
const generateInputErrorPath = basePath => [...basePath, 'errorText']
const generateInputDropdownStatusPath = basePath => [...basePath, 'isOpen']
const generateInputDropdownSearchPath = basePath => [...basePath, 'searchText']

// ACTIONS
const setInputValue = createAction(`${MODULE_NAME} SET_INPUT_VALUE`, ({ path, value, errors }) => ({
  path,
  value,
  errors
}))
const setDropdownInputSearch = createAction(
  `${MODULE_NAME} SET_DROPDOWN_INPUT_SEARCH`,
  ({ path, value }) => ({ path, value })
)
const setInputDropdownStatus = createAction(
  `${MODULE_NAME} SET_DROPDOWN_STATUS`,
  ({ path, value }) => ({ path, value })
)
const setDropdownInputValue = createAction(
  `${MODULE_NAME} SET_DROPDOWN_VALUE`,
  ({ path, value, label }) => ({ path, value, label })
)
const setInputOnBlur = createAction(`${MODULE_NAME} SET_INPUT_ON_BLUR`, ({ path }) => ({
  path
}))
const setInputOnFocus = createAction(`${MODULE_NAME} SET_INPUT_ON_FOCUS`, ({ path }) => ({ path }))
const onArrowClick = createAction(`${MODULE_NAME} ON_ARROW_CLICK`, ({ path, value }) => ({
  path,
  value
}))
const onCrossClick = createAction(`${MODULE_NAME} ON_CROSS_CLICK`, ({ path }) => ({ path }))

// MUTATORS
const setInputValueState = ({ path, value }) => state =>
  state.setIn(generateInputValuePath(path), value)

const setInputErrorState = ({ path, errors }) => state =>
  state.setIn(generateInputErrorPath(path), errors[0].msg)

const clearInputErrorState = ({ path }) => state => state.setIn(generateInputErrorPath(path), '')

const setInputIsErrowShownState = ({ path, value }) => state =>
  state.setIn(generateInputIsErrorShownPath(path), value)

const setInputIsFocusState = ({ path, value }) => state =>
  state.setIn(generateInputIsFocusPath(path), value)

const setInputIsTouchedState = ({ path, value }) => state =>
  state.setIn(generateInputIsTouchedPath(path), value)

const setInputDropdownStatusState = ({ path, value }) => state =>
  state.setIn(generateInputDropdownStatusPath(path), value)

const setIputDropdownLabelState = ({ path, label }) => state =>
  state.setIn(generateInputDropdownSearchPath(path), label)

const setDropdownInputSearchState = ({ path, value }) => state =>
  state.setIn(generateInputDropdownSearchPath(path), value)

const inputValueContainsError = ({ errors }) => state => errors.length > 0
const inputIsTouched = ({ path }) => state => state.getIn(generateInputIsTouchedPath(path))

const reducer = {
  [setInputValue]: (state, payload) =>
    pipe(
      [
        setInputValueState(payload),
        setInputIsTouchedState({ ...payload, value: true }),
        branchIf(
          inputValueContainsError(payload),
          setInputErrorState(payload),
          clearInputErrorState(payload)
        )
      ],
      state
    ),
  [setDropdownInputSearch]: (state, payload) => setDropdownInputSearchState(payload)(state),
  [setInputDropdownStatus]: (state, payload) => setInputDropdownStatusState(payload)(state),
  [setDropdownInputValue]: (state, payload) =>
    pipe(
      [
        setInputValueState(payload),
        setInputIsTouchedState({ ...payload, value: true }),
        setIputDropdownLabelState(payload),
        setInputDropdownStatusState({
          ...payload,
          value: false
        })
      ],
      state
    ),
  [setInputOnBlur]: (state, payload) =>
    pipe(
      [
        setInputIsFocusState({ ...payload, value: false }),
        setInputDropdownStatusState({ ...payload, value: false }),
        branchIf(inputIsTouched(payload), setInputIsErrowShownState({ ...payload, value: true }))
      ],
      state
    ),
  [setInputOnFocus]: (state, payload) =>
    pipe(
      [
        setInputIsFocusState({ ...payload, value: true }),
        setInputDropdownStatusState({ ...payload, value: true })
      ],
      state
    ),
  [onArrowClick]: (state, payload) =>
    pipe([setInputIsFocusState(payload), setInputDropdownStatusState(payload)], state),
  [onCrossClick]: (state, payload) =>
    pipe(
      [
        setInputIsFocusState({ ...payload, value: true }),
        setInputDropdownStatusState({ ...payload, value: true }),
        setIputDropdownLabelState({ ...payload, value: '' })
      ],
      state
    )
}

// SELECTORS
const formStateSelector = formPath => state => state.getIn(formPath, Map())
const isFormFieldsValid = formPath =>
  createSelector(
    formStateSelector(formPath),
    formState => formState.filter(inputState => inputState.get('errorText')).count() === 0
  )
const isFormFieldsFilled = formPath =>
  createSelector(
    formStateSelector(formPath),
    formState => formState.filter(inputState => !inputState.get('value')).count() === 0
  )

export default {
  actions: {
    setInputValue,
    setInputDropdownStatus,
    setDropdownInputValue,
    setInputOnFocus,
    setInputOnBlur,
    setDropdownInputSearch,
    onArrowClick,
    onCrossClick
  },
  reducer,
  select: {
    isFormFieldsValid,
    isFormFieldsFilled
  }
}
