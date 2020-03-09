/**
 * CalculatorDisplay
 */

import React, { Component } from 'react';
import { AsyncStorage, Alert, StyleSheet, Dimensions, FlatList, View, Text, TouchableHighlight } from 'react-native';
let deviceWidth = Dimensions.get('window').width


export default class CalculatorDisplay extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            scale: 1,
            Histoy: [],
            ShowHistory: false,
        }
    }

    ShowHistory = async () => {
        //get data from storage and set init state
        this.setState({ ShowHistory: !this.state.ShowHistory })
        const myValue = await AsyncStorage.getItem('array');
        this.setState({ Histoy: JSON.parse(myValue) });
    }

    componentDidMount = async () => {

    }

    handleTextLayout = (e) => {
        const { scale } = this.state
        const { width, x } = e.nativeEvent.layout
        const maxWidth = width + x
        const actualWidth = width / scale
        const newScale = maxWidth / actualWidth
        if (x < 0) {
            this.setState({ scale: newScale })
        } else if (x > width) {
            this.setState({ scale: 1 })
        }
    };

    render() {
        const { value } = this.props
        const { scale } = this.state

        const language = navigator.language || 'en-US'
        let formattedValue = parseFloat(value).toLocaleString(language, {
            useGrouping: true,
            maximumFractionDigits: 6
        })

        const trailingZeros = value.match(/\.0*$/)

        if (trailingZeros)
            formattedValue += trailingZeros

        return (
            <View style={calculatorDisplayStyles.root}>
                {this.state.ShowHistory ? (
                    <FlatList
                        data={this.state.Histoy}
                        renderItem={({ item }) =>
                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: '#fff', textAlign: 'center' }}>{item.value}</Text>
                                <Text style={{ color: '#fff', textAlign: 'center' }}>{item.Date}</Text>
                            </View>
                        }
                    // keyExtractor={item => item.id}
                    />
                ) : <Text
                        children={formattedValue}
                        onLayout={this.handleTextLayout}
                        style={[
                            calculatorDisplayStyles.text,
                            { transform: [{ scale }] }
                        ]}
                    />}

                <TouchableHighlight style={{ position: 'absolute', right: 20, top: 10 }} onPress={() => this.ShowHistory()}>
                    {this.state.ShowHistory ? (
                        <Text style={{ color: '#fff' }}>Hide History</Text>
                    ) : (
                            <Text style={{ color: '#fff' }}>Show History</Text>
                        )}
                </TouchableHighlight>
            </View>
        )
    }
}

const calculatorDisplayStyles = StyleSheet.create({
    root: {
        backgroundColor: '#d24c4b',
        flex: 1,
        justifyContent: 'center'
    },
    text: {
        alignSelf: 'flex-end',
        color: 'white',
        fontSize: 40,
        paddingHorizontal: 30,
        right: 0,
        fontWeight: 'bold'
    }
})