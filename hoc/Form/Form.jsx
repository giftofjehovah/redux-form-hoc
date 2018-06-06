import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { form } from 'modules/index'
import { mapInputStateAndEventHandlersToProps } from './helpers'

const { Provider, Consumer } = createContext({})

const Form = props => {
  const { baseStatePath, children, state, actions } = props
  const formState = state.getIn(baseStatePath, Map())
  const contextState = {
    baseStatePath,
    state: formState,
    eventHandlers: actions
  }
  return (
    <Provider value={contextState}>
      {children}
    </Provider>
  )
}

Form.propTypes = {
  baseStatePath: PropTypes.array,
  children: PropTypes.node,
  state: ImmutablePropTypes.map,
  actions: PropTypes.object
}

const s = ({ state }) => ({
  state: state
})
const d = d => ({
  actions: bindActionCreators({ ...form.actions }, d)
})

const ConnectedForm = connect(s, d)(Form)

const Input = props => {
  const {
    inputName,
    isDropdown,
    children,
    validators,
    isRadio,
    additionalEventHandlers = {},
    overwriteProps = {},
    isRequired
  } = props

  return (
    <Consumer>
      {({ state, baseStatePath, eventHandlers }) => {
        return (
          <children.type
            {...children.props}
            {...mapInputStateAndEventHandlersToProps(
              {
                inputState: state.get(inputName, Map()),
                eventHandlers,
                path: [...baseStatePath, inputName],
                validators,
                additionalEventHandlers
              },
              { isDropdown, isRadio }
            )}
            placeholder={
              isRequired ? `${children.props.placeholder} *` : children.props.placeholder
            }
            {...overwriteProps}
          />
        )
      }}
    </Consumer>
  )
}

Input.propTypes = {
  inputName: PropTypes.string.isRequired,
  children: PropTypes.node,
  isDropdown: PropTypes.bool,
  validators: PropTypes.array,
  additionalEventHandlers: PropTypes.object,
  isRadio: PropTypes.bool,
  overwriteProps: PropTypes.object,
  isRequired: PropTypes.bool
}

ConnectedForm.Input = Input

export default ConnectedForm
