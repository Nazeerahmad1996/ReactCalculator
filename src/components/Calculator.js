import React, { Component } from 'react';
import { AsyncStorage, Alert, StyleSheet, Dimensions, FlatList, View, Text, TouchableHighlight } from 'react-native';
let deviceWidth = Dimensions.get('window').width
import CalculatorDisplay from './CalculatorDisplay'



class KeyboardInput extends React.Component {
    handleKeyDown(event) {
        if (this.props.onKeyDown)
            this.props.onKeyDown(event)
    }

    componentDidMount() {
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    componentWillUnmount() {
    }

    render() {
        return null
    }
}



/**
 * CalculatorKey
 */
class CalculatorKey extends React.Component {
    render() {
        const { children, onPress, style, textStyle } = this.props

        return (
            <TouchableHighlight
                accessibilityRole="button"
                onPress={onPress}
                style={[
                    calculatorKeyStyles.root,
                    style
                ]}
                underlayColor='rgba(0,0,0,0.25)'
            >
                <Text
                    children={children}
                    style={[
                        calculatorKeyStyles.text,
                        textStyle
                    ]}
                />
            </TouchableHighlight>
        )
    }
}

const calculatorKeyStyles = StyleSheet.create({
    root: {
    },
    text: {
        lineHeight: 80,
        textAlign: 'center',
        color: '#d24c4b',
        fontSize: 21,
        textAlign: 'center'
    }
})

const CalculatorOperations = {
    '/': (prevValue, nextValue) => prevValue / nextValue,
    '*': (prevValue, nextValue) => prevValue * nextValue,
    '+': (prevValue, nextValue) => prevValue + nextValue,
    '-': (prevValue, nextValue) => prevValue - nextValue,
    '=': (prevValue, nextValue) => nextValue
}

/**
 * Calculator
 */


const DigitKey = (props) => (
    <CalculatorKey
        {...props}
        style={[calculatorStyles.digitKey, props.style]}
        textStyle={[calculatorStyles.digitKeyText, props.textStyle]}
    />
)

const FunctionKey = (props) => (
    <CalculatorKey
        {...props}
        style={[calculatorStyles.functionKey, props.style]}
        textStyle={[calculatorStyles.functionKeyText, props.textStyle]}
    />
)

const OperatorKey = (props) => (
    <CalculatorKey
        {...props}
        style={[calculatorStyles.operatorKey, props.style]}
        textStyle={[calculatorStyles.operatorKeyText, props.textStyle]}
    />
)


export default class Calculator extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            value: null,
            displayValue: '0',
            operator: null,
            waitingForOperand: false,
            history: []
        }
    }

    clearAll() {
        this.setState({
            value: null,
            displayValue: '0',
            operator: null,
            waitingForOperand: false
        })
    }

    clearDisplay() {
        this.setState({
            displayValue: '0'
        })
    }

    clearLastChar() {
        const { displayValue } = this.state

        this.setState({
            displayValue: displayValue.substring(0, displayValue.length - 1) || '0'
        })
    }

    inputPercent() {
        const { displayValue } = this.state
        const currentValue = parseFloat(displayValue)

        if (currentValue === 0)
            return

        const fixedDigits = displayValue.replace(/^-?\d*\.?/, '')
        const newValue = parseFloat(displayValue) / 100

        this.setState({
            displayValue: String(newValue.toFixed(fixedDigits.length + 2))
        })
    }

    inputDot() {
        const { displayValue } = this.state

        if (!(/\./).test(displayValue)) {
            this.setState({
                displayValue: displayValue + '.',
                waitingForOperand: false
            })
        }
    }

    inputDigit(digit) {
        const { displayValue, waitingForOperand } = this.state

        if (waitingForOperand) {
            this.setState({
                displayValue: String(digit),
                waitingForOperand: false
            })
        } else {
            this.setState({
                displayValue: displayValue === '0' ? String(digit) : displayValue + digit
            })
        }
    }



    performOperation = async (nextOperator) => {
        const { value, displayValue, operator } = this.state
        const inputValue = parseFloat(displayValue)

        if (value == null) {
            this.setState({
                value: inputValue
            })
        } else if (operator) {
            const currentValue = value || 0
            const newValue = CalculatorOperations[operator](currentValue, inputValue)

            //created new object for storage
            const Object = {
                value: newValue,
                Date: new Date()
            }

            try {
                //get value from storage
                const value = await AsyncStorage.getItem('array');
                //if found anyting in storage
                if (value !== null) {

                    var dummy = JSON.parse(value)

                    try {
                        await AsyncStorage.removeItem('array');
                    }
                    catch (exception) {
                    }
                    dummy.push(Object);
                    AsyncStorage.setItem('array', JSON.stringify(dummy));

                }
                //if not found anyting in storage
                else {
                    const Array = this.state.history.slice();
                    Array.push(Object)
                    AsyncStorage.setItem('array', JSON.stringify(Array));
                }
            } catch (error) {
                console.log(error)
            }



            this.setState({
                value: newValue,
                displayValue: String(newValue)
            })
        }



        this.setState({
            waitingForOperand: true,
            operator: nextOperator
        })
    }

    handleKeyDown(event) {
        let { key } = event

        if (key === 'Enter') {
            key = '='

        }
        if ((/\d/).test(key)) {
            event.preventDefault()
            this.inputDigit(parseInt(key, 10))
        } else if (key in CalculatorOperations) {
            event.preventDefault()
            this.performOperation(key)
        } else if (key === '.') {
            event.preventDefault()
            this.inputDot()
        } else if (key === '%') {
            event.preventDefault()
            this.inputPercent()
        } else if (key === 'Backspace') {
            event.preventDefault()
            this.clearLastChar()
        } else if (key === 'Clear') {
            event.preventDefault()

            if (this.state.displayValue !== '0') {
                this.clearDisplay()
            } else {
                this.clearAll()
            }
        }
    }

    render() {
        const { displayValue } = this.state

        const clearDisplay = displayValue !== '0'
        const clearText = clearDisplay ? 'C' : 'AC'

        return (
            <View style={calculatorStyles.root}>
                <KeyboardInput onKeyDown={event => this.handleKeyDown(event)} />
                <CalculatorDisplay value={displayValue} />
                <View style={calculatorStyles.keypad}>
                    <View style={calculatorStyles.inputKeys}>
                        <View style={calculatorStyles.functionKeys}>
                            <FunctionKey style={{ width: deviceWidth / 3 }} onPress={() => clearDisplay ? this.clearDisplay() : this.clearAll()}>{clearText}</FunctionKey>
                            <FunctionKey onPress={() => this.inputPercent()} style={[calculatorStyles.keyPercent, { width: deviceWidth / 3 }]}>%</FunctionKey>
                        </View>
                        <View style={calculatorStyles.digitKeys}>
                            <DigitKey onPress={() => this.inputDigit(0)} style={calculatorStyles.key0} textStyle={{ textAlign: 'center' }}>0</DigitKey>
                            <DigitKey onPress={() => this.inputDot()} style={calculatorStyles.keyDot} textStyle={calculatorStyles.keyDotText}>.</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(1)}>1</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(2)}>2</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(3)}>3</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(4)}>4</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(5)}>5</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(6)}>6</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(7)}>7</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(8)}>8</DigitKey>
                            <DigitKey style={calculatorStyles.Buttonstyles} onPress={() => this.inputDigit(9)}>9</DigitKey>
                        </View>
                    </View>
                    <View style={calculatorStyles.operatorKeys}>
                        <OperatorKey style={calculatorStyles.Buttonstyles} onPress={() => this.performOperation('/')}>÷</OperatorKey>
                        <OperatorKey style={calculatorStyles.Buttonstyles} onPress={() => this.performOperation('*')}>×</OperatorKey>
                        <OperatorKey style={calculatorStyles.Buttonstyles} onPress={() => this.performOperation('-')}>−</OperatorKey>
                        <OperatorKey style={calculatorStyles.Buttonstyles} onPress={() => this.performOperation('+')}>+</OperatorKey>
                        <OperatorKey style={calculatorStyles.Buttonstyles} onPress={() => this.performOperation('=')}>=</OperatorKey>
                    </View>
                </View>
            </View>
        )
    }
}

const calculatorStyles = StyleSheet.create({
    root: {
        width: '100%',
        height: '100%',
    },
    keypad: {
        height: 400,
        flexDirection: 'row',
        width: '100%'
    },
    inputKeys: {
        flex: 1,
    },
    calculatorKeyText: {
        fontSize: 12
    },
    functionKeys: {
        backgroundColor: '#1e202a',
        flexDirection: 'row',
        color: '#fff',

    },
    functionKey: {
        fontSize: 12,
        width: deviceWidth / 4,

    },
    Buttonstyles: {
        width: deviceWidth / 4,
    },
    digitKeys: {
        backgroundColor: '#1e202a',
        flexDirection: 'row',
        flexWrap: 'wrap-reverse',
        color: '#fff'
    },
    digitKeyText: {
        // fontSize: 18
    },
    operatorKeys: {
        backgroundColor: '#1e202a',
        // backgroundImage: 'linear-gradient(to bottom, rgba(252,156,23,1) 0%, rgba(247,126,27,1) 100%)'
    },
    operatorKey: {
        borderRightWidth: 0
    },
    operatorKeyText: {

    },
    keyMultiplyText: {
        lineHeight: 50
    },
    key0: {
        // paddingLeft: 32,
        width: deviceWidth / 2
    },
    keyDot: {
        overflow: 'hidden',
        width: deviceWidth / 4,
    },
    keyDotText: {
        fontSize: 40,
        marginTop: -10
    }
})