import React, { Component, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatar, Button, Card, Title, Paragraph, TextInput } from 'react-native-paper';
import { UserContext } from '../UserContext';
import Modal from 'react-native-modal';
import { Rating, AirbnbRating } from 'react-native-ratings';
import AwesomeAlert from 'react-native-awesome-alerts';
import { IconButton } from 'react-native-paper';
import TextInput3 from '../components/TextInput3';
import {
      messageValidator
} from '../core/utils';

export default class OpenServices extends Component {

      static contextType = UserContext;

      handleOptionChange(event) {

            const user = this.context

      }

      constructor(props) {
            super(props);

            this.state = {
                  workerModalVisibility: false,
                  completedServiceVisibility: false,
                  messageVisibility: false,
                  listServices: [],
                  showAlert: false,
                  noServices: false,
                  message: { value: '', error: '' },
                  messageAlert: false,
                  workerID: [],
                  receiverID: '',
                  selectedService: '',
                  selectedWorker: ''
            };

      }

      hideAlert = () => {
            this.setState({
                  showAlert: false,
                  completedServiceVisibility: false
            });

            this.getData()
      };

      hideAlert2 = () => {
            this.setState({
                  messageAlert: false,
                  messageVisibility: false
            });

            this.getData()
      };

      functionN = (n) => {
            return n > 9 ? "" + n : "0" + n;
      }

      transformDate = (date) => {
            let dateToSplit = date.substring(0, 10);
            let dateSplit = dateToSplit.split("-");
            return this.functionN(+dateSplit[2]) + "-" + dateSplit[1] + "-" + dateSplit[0];
      }

      getAge(dateString) {
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
            }
            return age;
      }

      getRating(counter, total) {
            if (!(counter == null)) {

                  return (total / counter).toFixed(2)

            } else {
                  return 0
            }
      }

      getRatingText(counter, total) {
            if (!(counter == null)) {

                  return (total / counter).toFixed(2);

            } else {
                  return 'No evaluations'
            }
      }

      sendNotification = () => {

            fetch('http://localhost:8080/notifications/createNotification', {
                  method: 'POST',
                  headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        content: "Your service is over, you can evaluate your client",
                        user: this.state.selectedWorker
                  }),
            }).then((response2) => {
                  return response2.text();
            }).then((responseText2) => {


            }).catch(
                  function (error) {
                        console.error(error);
                  }
            );

      }

      ratingCompleted(rating) {

            fetch('http://localhost:8080/services/updateService', {
                  method: 'POST',
                  headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        _id: this.state.selectedService,
                        state: "Completed",
                        rating: rating
                  }),
            }).then((response2) => {
                  return response2.json();
            }).then((responseText2) => {

                  this.setState({
                        showAlert: true
                  });

                  this.sendNotification()


            }).catch(
                  function (error) {
                        console.error(error);
                  }
            );

      }

      dontEvaluate() {

            fetch('http://localhost:8080/services/updateService', {
                  method: 'POST',
                  headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        _id: this.state.selectedService,
                        state: "Completed",
                        rating: null
                  }),
            }).then((response2) => {
                  return response2.json();
            }).then((responseText2) => {

                  this.setState({
                        showAlert: true
                  });

                  this.sendNotification()


            }).catch(
                  function (error) {
                        console.error(error);
                  }
            );

      }

      getData = () => {

            this.setState({
                  listServices: []
            })

            fetch('http://localhost:8080/services/clientServices', {
                  method: 'POST',
                  headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                        user: this.context.user["_id"],
                        // user: '5ee64f78e3e46a0fe883174b',
                        state: 'Open'
                  }),
            }).then((response) => {
                  return response.json();
            }).then((responseText) => {

                  if (!(responseText && responseText.length > 0)) {
                        this.setState({ noServices: true })
                  }

                  /********************************************* GET RELATIONS ******************************************/

                  for (let i = 0; i < responseText.length; i++) {

                        fetch('http://localhost:8080/relations/findRelationsbyUser', {
                              method: 'POST',
                              headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                    service: responseText[i]['_id'],
                                    state: true
                              }),
                        }).then((response2) => {
                              return response2.json();
                        }).then((responseText2) => {

                              // this.state.listServices.push(responseText2[0])
                              this.setState(prevState => ({
                                    listServices: [...prevState.listServices, responseText2[0]]
                              }))


                        }).catch(
                              function (error) {
                                    console.error(error);
                              }
                        );

                  }

            }).catch(
                  function (error) {
                        console.error(error);
                  }
            );
      }

      componentDidMount() {

            this.getData()

      }

      sendMessage = () => {

            const messageError = messageValidator(this.state.message.value);

            if (messageError) {

                  this.setState({ message: { value: this.state.message.value, error: messageError } });
                  return;

            } else {

                  fetch('http://localhost:8080/chats/createChat', {
                        method: 'POST',
                        headers: {
                              Accept: 'application/json',
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                              participant1: this.context.user["_id"],
                              participant2: this.state.receiverID,
                              content: this.context.user["name"] + ": " + this.state.message.value
                        }),
                  }).then((response2) => {
                        return response2.json();
                  }).then((responseText2) => {

                        fetch('http://localhost:8080/notifications/createNotification', {
                              method: 'POST',
                              headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                    content: "You have a new message",
                                    user: this.state.receiverID
                              }),
                        }).then((response3) => {
                              return response3.text();
                        }).then((responseText3) => {

                              this.setState({ message: { value: '' }, messageAlert: true })

                        }).catch(
                              function (error) {
                                    console.error(error);
                              }
                        );




                  }).catch(
                        function (error) {
                              console.error(error);
                        }
                  );

            }

      }

      render() {

            return (

                  <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%', }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">
                        <View style={styles.view}>

                              {this.state.noServices ? <Text style={{ marginTop: 10 }}> No open services</Text> : null}

                              <FlatList
                                    data={this.state.listServices}
                                    keyExtractor={item => item._id}
                                    renderItem={({ item }) => {

                                          return (
                                                <View>

                                                      <Card style={styles.card}>
                                                            <Card.Content>

                                                                  <View >
                                                                        <Paragraph style={styles.paragraph}>Work Area</Paragraph>
                                                                        <Title style={styles.title}>{item.service[0].workArea}</Title>
                                                                  </View>

                                                                  <View style={{ flexDirection: "row" }}>

                                                                        <View style={{ flex: 1 }}>
                                                                              <Paragraph style={styles.paragraph}>Start Date</Paragraph>
                                                                              <Title style={styles.title}>{this.transformDate(item.service[0].startDate)}</Title>
                                                                        </View>

                                                                        <View style={{ flex: 1 }}>
                                                                              <Paragraph style={styles.paragraph}>End Date</Paragraph>
                                                                              <Title style={styles.title}>{this.transformDate(item.service[0].endDate)}</Title>
                                                                        </View>
                                                                  </View>

                                                                  <View >
                                                                        <Paragraph style={styles.paragraph}>Location</Paragraph>
                                                                        <Title style={styles.title}>{item.service[0].address} </Title>
                                                                  </View>

                                                                  <View >
                                                                        <Paragraph style={styles.paragraph}>Description</Paragraph>
                                                                        {item.service[0].description == '' ? <Text style={{ marginTop: 10, marginBottom: 10 }}>No description</Text> : <Title style={styles.title}>{item.service[0].description} </Title>}
                                                                  </View>

                                                                  <View >
                                                                        <Paragraph style={styles.paragraph}>Worker</Paragraph>

                                                                        <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
                                                                              <TouchableOpacity onPress={() => this.setState({ workerModalVisibility: true, workerID: item })}>
                                                                                    <View style={{ flexDirection: "row" }}>
                                                                                          <Avatar.Image size={40} source={{ uri: 'http://192.168.1.69:8080/' + item.worker[0].user[0].photo }} style={styles.photo} />

                                                                                          <View style={{ marginTop: 12 }}>
                                                                                                <Title style={styles.title}>{item.worker[0].user[0].name}</Title>
                                                                                          </View>
                                                                                    </View>
                                                                              </TouchableOpacity>

                                                                              <IconButton
                                                                                    icon="message"
                                                                                    color={'#707070'}
                                                                                    size={25}
                                                                                    style={styles.open}
                                                                                    onPress={() => this.setState({ messageVisibility: true, receiverID: item.worker[0].user[0]._id, })}
                                                                              />

                                                                        </View>

                                                                  </View>



                                                            </Card.Content>

                                                            <Card.Actions >

                                                                  <View style={{ width: '100%', alignItems: 'flex-end' }}>
                                                                        <Button onPress={() => this.setState({ completedServiceVisibility: true, selectedService: item.service[0]._id, selectedWorker: item.worker[0].user[0]._id })}>Completed Service</Button>
                                                                  </View>

                                                            </Card.Actions>

                                                      </Card>

                                                </View>

                                          )
                                    }}
                              />

                              {/******************************** MODALS  *************************************/}

                              <Modal
                                    isVisible={this.state.workerModalVisibility}
                                    onBackdropPress={() => this.setState({ workerModalVisibility: false })}
                              >

                                    {this.state.workerModalVisibility ?

                                          <View style={styles.workerModal}>

                                                <View style={{ alignSelf: 'center' }}>
                                                      <Avatar.Image size={65} source={{ uri: 'http://192.168.1.69:8080/' + this.state.workerID.worker[0].user[0].photo }} style={styles.photo2} />
                                                </View>

                                                <Paragraph style={styles.paragraph}>Name</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].user[0].name}</Title>

                                                <Paragraph style={styles.paragraph}>Address</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].user[0].address}</Title>

                                                <Paragraph style={styles.paragraph}>Phone Number</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].user[0].phoneNumber}</Title>

                                                <Paragraph style={styles.paragraph}>Age</Paragraph>
                                                <Title style={styles.title}>{this.getAge(this.state.workerID.worker[0].user[0].birthdate)}</Title>

                                                <Paragraph style={styles.paragraph}>Gender</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].user[0].gender}</Title>

                                                <Paragraph style={styles.paragraph}>Work Area</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].area}</Title>

                                                <Paragraph style={styles.paragraph}>Experience</Paragraph>
                                                <Title style={styles.title}>{this.state.workerID.worker[0].experience} years</Title>

                                                <Paragraph style={styles.paragraph}>Rating</Paragraph>
                                                <View style={{ flexDirection: "row" }}>
                                                      <Rating
                                                            type='custom'
                                                            imageSize={23}
                                                            tintColor='white'
                                                            readonly={true}
                                                            ratingBackgroundColor='#C0C0C0'
                                                            startingValue={this.getRating(this.state.workerID.worker[0].ratingCounter, this.state.workerID.worker[0].ratingTotal)}
                                                      />
                                                      <Title style={styles.ratingNumber}>{this.getRatingText(this.state.workerID.worker[0].ratingCounter, this.state.workerID.worker[0].ratingTotal)}</Title>
                                                </View>

                                                <View style={{ alignSelf: 'center', marginTop: 10 }}>
                                                      <Button
                                                            style={{ backgroundColor: '#D0D0D0' }}
                                                            onPress={() => this.setState({ workerModalVisibility: false })}
                                                      >
                                                            <Text style={{ color: 'white', fontWeight: "bold" }}>Close</Text>
                                                      </Button>
                                                </View>

                                          </View>

                                          : null}

                              </Modal>

                              <Modal
                                    isVisible={this.state.messageVisibility}
                                    onBackdropPress={() => this.setState({ messageVisibility: false, message: { value: '' } })}
                              >
                                    <View style={styles.messageModal}>

                                          <TextInput3
                                                placeholder="Type your message here..."
                                                value={this.state.message.value}
                                                onChangeText={text => this.setState({ message: { value: text } })}
                                                theme={{ colors: { primary: 'tranparent' } }}
                                                multiline={true}
                                                numberOfLines={6}
                                                error={!!this.state.message.error}
                                                errorText={this.state.message.error}
                                          />

                                          <View style={{ flexDirection: "row", marginTop: 20 }}>

                                                <Button
                                                      style={{ backgroundColor: '#2292A4', flex: 1, marginRight: 15 }}
                                                      onPress={() => this.sendMessage()}
                                                >
                                                      <Text style={{ color: 'white', fontWeight: "bold" }}>Send</Text>
                                                </Button>

                                                <Button
                                                      style={{ backgroundColor: '#D0D0D0', flex: 1 }}
                                                      onPress={() => this.setState({ messageVisibility: false, message: { value: '' } })}
                                                >
                                                      <Text style={{ color: 'white', fontWeight: "bold" }}>Close</Text>
                                                </Button>

                                          </View>
                                    </View>
                              </Modal>

                              <Modal
                                    isVisible={this.state.completedServiceVisibility}
                                    onBackdropPress={() => this.setState({ completedServiceVisibility: false })}
                              >
                                    <View style={styles.ratingrModal}>
                                          <AirbnbRating
                                                size={40}
                                                showRating={false}
                                                defaultRating={0}
                                                onFinishRating={(rating) => { this.ratingCompleted(rating) }}
                                          />

                                          <Button
                                                style={{ backgroundColor: '#2292A4', marginTop: 25 }}
                                                onPress={() => this.dontEvaluate()}
                                          >
                                                <Text style={{ color: 'white', fontWeight: "bold" }}>Don't evaluate</Text>
                                          </Button>
                                    </View>
                              </Modal>

                              <AwesomeAlert
                                    show={this.state.showAlert}
                                    showProgress={false}
                                    title="Service ended"
                                    closeOnTouchOutside={false}
                                    closeOnHardwareBackPress={false}
                                    showConfirmButton={true}
                                    confirmText="Ok"
                                    confirmButtonColor="#2292A4"
                                    onConfirmPressed={() => {
                                          this.hideAlert();
                                    }}
                                    confirmButtonStyle={{
                                          width: 50,
                                    }}
                                    confirmButtonTextStyle={{
                                          alignSelf: 'center',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                    }}
                              />

                              <AwesomeAlert
                                    show={this.state.messageAlert}
                                    showProgress={false}
                                    title="Message sent"
                                    closeOnTouchOutside={false}
                                    closeOnHardwareBackPress={false}
                                    showConfirmButton={true}
                                    confirmText="Ok"
                                    confirmButtonColor="#2292A4"
                                    onConfirmPressed={() => {
                                          this.hideAlert2();
                                    }}
                                    confirmButtonStyle={{
                                          width: 50,
                                    }}
                                    confirmButtonTextStyle={{
                                          alignSelf: 'center',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                    }}
                              />

                        </View>

                  </ScrollView>



            )
      }
};

const styles = StyleSheet.create({
      view: {
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
            padding: 15,
            backgroundColor: '#EEEEEE'
      },
      card: {
            width: '100%',
            padding: 15,
            marginVertical: 10,
            borderRadius: 20,
            elevation: 2
      },
      paragraph: {
            color: '#707070',
            fontSize: 13,
            marginBottom: -2
      },
      title: {
            bottom: 4,
            fontSize: 18
      },
      photo: {
            marginTop: 5,
            marginRight: 10
      },
      photo2: {
            marginBottom: 15
      },
      workerModal: {
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            alignSelf: 'center',
            alignItems: 'flex-start',
            justifyContent: 'center',
            borderRadius: 20,
            paddingLeft: 30,
            paddingRight: 30,
      },
      ratingNumber: {
            bottom: 6,
            fontSize: 18,
            marginLeft: 10
      },
      ratingrModal: {
            width: '80%',
            height: '30%',
            backgroundColor: 'white',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            paddingLeft: 30,
            paddingRight: 30,
      },
      messageModal: {
            width: '100%',

            backgroundColor: 'white',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            padding: 30
      },
      open: {
            marginTop: 5,
            marginLeft: 90,
      },
});

