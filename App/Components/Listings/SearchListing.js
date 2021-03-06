var _ = require('underscore');

import React, {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Component,
  Dimensions,
  Animated,
  ScrollView,
  TouchableHighlight,
  ActivityIndicatorIOS
} from 'react-native';

import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';


const deviceWidth       = Dimensions.get('window').width;
const deviceHeight      = Dimensions.get('window').height;

class SearchListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      description: ''
    };
  }

  handleChange (text) {
    this.setState({ description: text});
    this.props.changeListing(this.state.description);
  }

  render () {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.handleChange(text)}
          value={this.state.text}
          placeholder="Find a friend for"
          maxLength={100}
          />
      </View>
    );
  }
}

module.exports = SearchListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 0,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  name: {
    marginTop: 15,
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  textInput: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    marginTop:0,
    marginBottom: 0,
    marginRight: 10,
    marginLeft: 10,
    borderRadius:4,
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#eee',
    flex: 1,
    fontSize: 15,
    color: '#333',
    borderColor: '#ddd',
    borderWidth: 1
  }
});





