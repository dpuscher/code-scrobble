import React from 'react';
import Router from 'next/router';
import Scanner from '../components/scanner/Scanner';
import Layout from '../components/layout/Layout';
import { Center } from './styles/index.styles';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false };
  }

  componentDidMount() {
    this.setState({ loggedIn: true });
    // if (localStorage.getItem('session')) {
    // } else {
    //   Router.push('/login');
    // }
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <Layout>
        <Center>
          {loggedIn && <Scanner />}
        </Center>
      </Layout>
    );
  }
}

export default Index;
