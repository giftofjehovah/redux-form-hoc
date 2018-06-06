import { identityFunc } from 'lib/utils'

const createRunValidators = validators => value =>
  validators.map(validator => validator(value)).filter(status => status.isError)

// INPUT FIELD HELPERS
const createInputFieldState = inputState => ({
  value: inputState.get('value') || '',
  hint: inputState.get('hint'),
  errorText: inputState.get('errorText'),
  showError: inputState.get('isErrorShown', false),
  isFocused: inputState.get('isFocused', false),
  disabled: !inputState.get('isEnabled', true)
})

const createInputFieldEventHandlers = ({
  eventHandlers: { setInputValue, setInputOnFocus, setInputOnBlur },
  path,
  validators = [],
  additionalEventHandlers: { onChange: addOnChange, onFocus: addOnFocus, onBlur: addOnBlur }
}) => {
  const runValidators = createRunValidators(validators)
  return {
    onChange: value =>
      setInputValue({ path, value, errors: runValidators(value) }) && addOnChange(value),
    onFocus: e => setInputOnFocus({ path }) && addOnFocus(e),
    onBlur: e => setInputOnBlur({ path }) && addOnBlur(e)
  }
}

// DROPDOWN HELPERS
const createDropdownState = inputState => ({
  ...createInputFieldState(inputState),
  dropDownBoxVisibility: inputState.get('isOpen'),
  options: inputState.get('options'),
  searchText: inputState.get('searchText', '')
})

const createDropdownEventHandlers = ({
  eventHandlers: {
    setInputValue,
    setInputOnFocus,
    setInputOnBlur,
    setDropdownInputSearch,
    setDropdownInputValue,
    onArrowClick,
    onCrossClick
  },
  path,
  additionalEventHandlers: {
    onChange: addOnChange,
    onFocus: addOnFocus,
    onBlur: addOnBlur,
    onItemClick: addOnItemClick
  }
}) => {
  return {
    onChange: value => setDropdownInputSearch({ path, value }) && addOnChange(value),
    onFocus: e => setInputOnFocus({ path }) && addOnFocus(e),
    onBlur: e => setInputOnBlur({ path }) && addOnBlur(e),
    onArrowClick: isFocused => onArrowClick({ path, value: !isFocused }),
    onCrossClick: () => onCrossClick({ path }),
    onItemClick: selectedOption => {
      setDropdownInputValue({
        path,
        value: selectedOption.get('value') || selectedOption.get('code'),
        label: selectedOption.get('label')
      }) && addOnItemClick(selectedOption)
    }
  }
}

// RADIO HELPERS
const createRadioState = inputState => ({
  selectedValue: inputState.get('value')
})

const createRadioEventHandler = ({ eventHandlers: { setInputValue }, path }) => ({
  onChange: value => setInputValue({ path, value, errors: [] })
})

const createStateBaseOnInputType = (inputState, { isDropdown = false, isRadio = false }) => {
  if (isDropdown) return createDropdownState(inputState)
  if (isRadio) return createRadioState(inputState)
  return createInputFieldState(inputState)
}

const createEventHandlerBaseOnInputType = (
  {
    eventHandlers,
    path,
    validators,
    additionalEventHandlers: {
      onChange = identityFunc,
      onFocus = identityFunc,
      onBlur = identityFunc,
      onItemClick = identityFunc
    }
  },
  { isDropdown = false, isRadio = false }
) => {
  if (isDropdown) {
    return createDropdownEventHandlers({
      eventHandlers,
      path,
      additionalEventHandlers: { onChange, onFocus, onBlur, onItemClick }
    })
  }
  if (isRadio) return createRadioEventHandler({ eventHandlers, path })
  return createInputFieldEventHandlers({
    eventHandlers,
    path,
    validators,
    additionalEventHandlers: { onChange, onFocus, onBlur }
  })
}

export const mapInputStateAndEventHandlersToProps = (
  { inputState, eventHandlers, path, validators, additionalEventHandlers },
  { isDropdown, isRadio }
) => ({
  ...createStateBaseOnInputType(inputState, { isDropdown, isRadio }),
  ...createEventHandlerBaseOnInputType(
    { eventHandlers, path, additionalEventHandlers, validators },
    { isDropdown, isRadio }
  )
})
