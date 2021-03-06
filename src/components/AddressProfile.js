import * as React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { theme } from '../core/theme';
import { useState, useRef, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';

const GOOGLE_PLACES_API_KEY = 'YOUR_API_KEY'; // Place here your google maps API key

const GooglePlaces = ({ errorText, ...props }) => {

      const { user } = useContext(UserContext);
      const userAddress = user["address"];

      const ref = useRef(null);

      useEffect(() => {
            ref.current?.setAddressText(userAddress);
      }, []);

      const onTextInputChange = function (event) {
            props.updateAddressState(event.nativeEvent.text);
      };

      return (
            <View style={styles.container}>
                  <GooglePlacesAutocomplete
                        ref={ref}
                        placeholder='Address'
                        query={{
                              key: GOOGLE_PLACES_API_KEY,
                              language: 'en', // language of the results
                        }}

                        onFail={(error) => console.error(error)}
                        currentLocation={false}
                        textInputProps={{
                              placeholderTextColor: '#717171',
                              onChange: onTextInputChange
                        }}
                        enablePoweredByContainer={false}
                        returnKeyType={'search'}
                        styles={{
                              textInputContainer: {
                                    backgroundColor: '#EEEEEE',
                                    marginBottom: 5
                              },
                              textInput: {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    height: 50,
                                    color: 'black',
                                    fontSize: 16,
                                    borderTopRightRadius: 10,
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    borderBottomRightRadius: 10,
                                    borderWidth: 2,
                                    borderColor: "#717171",
                                    backgroundColor: '#EEEEEE',
                                    paddingLeft: 16,
                                    paddingRight: 16
                              },
                              description: {
                                    fontWeight: 'bold',
                                    color: 'black',
                              },
                              row: {
                                    backgroundColor: 'rgba(0,0,0,0)'
                              }
                        }}
                        {...props}
                  />
                  {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

            </View>
      );
};

const styles = StyleSheet.create({
      container: {
            justifyContent: 'center',
            paddingTop: 0,
            backgroundColor: 'rgba(0,0,0,0)',
            width: '100%',
            marginTop: 12

      },
      error: {
            fontSize: 14,
            color: theme.colors.error,
            paddingHorizontal: 4,
            paddingTop: 4,
      },
});

export default GooglePlaces;
