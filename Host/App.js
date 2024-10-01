import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ErrorBoundary } from "react-error-boundary";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChunkManager } from '@callstack/repack/client';

const os = Platform.OS;
const isAndroid = os === 'android';
const localhost = isAndroid ? 'http://10.0.2.2' : 'http://localhost';

ChunkManager.configure({
  forceRemoteChunkResolution: true,
  resolveRemoteChunk: async (chunkId, parentId) => {
    let url;
    console.log('ChunkId = ', chunkId, ', parentId = ', parentId);

    switch (parentId) {
      case 'app1':
        url = `${localhost}:9000/${chunkId}.chunk.bundle`;
        break;
      case 'app2':
        url = `${localhost}:9001/${chunkId}.chunk.bundle`;
        break;
      case 'main':
      default:
        url = {
          // containers
          app1: `${localhost}:9000/app1.container.bundle`,
          app2: `${localhost}:9001/app2.container.bundle`,
        }[chunkId] ?? `${localhost}:8081/${chunkId}.chunk.bundle`;
        break;
    }

    return {
      url,
      query: { platform: os, },
      excludeExtension: true,
    };
  },
});

async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  // Download and execute container
  await ChunkManager.loadChunk(scope, 'main');

  const container = self[scope];

  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  const exports = factory();
  return exports;
}

const App1 = React.lazy(() => loadComponent('app1', './App.js'));
const App2 = React.lazy(() => loadComponent('app2', './App.js'));

function MFEWrapper({ App, appNumber }) {
  return (
    <ErrorBoundary fallback={
      <View style={styles.centerContents}>
        <Text style={styles.error}>
          {`Something went wrong while loading remote MFE ${appNumber}`}
        </Text>
      </View>
    }>
      <React.Suspense
        fallback={
          <View style={styles.centerContents}>
            <Text style={styles.loading}>{`Loading remote MFE ${appNumber}...`}</Text>
          </View>
        }>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  );
}

const MFEWrapper1 = () => <MFEWrapper App={App1} appNumber={1} />;
const MFEWrapper2 = () => <MFEWrapper App={App2} appNumber={2} />;

function HomeScreen() {
  return (
    <View style={styles.centerContents}>
      <Text style={styles.headerText}>Host Container</Text>
      <View style={styles.mfeContainer}>
        <MFEWrapper1 />
        {/* <Text>MFE App Two Multi-platform</Text> */}
      </View>
      <View style={styles.mfeContainer}>
        {/* <MFEWrapper2 /> */}
        <Text>MFE App Two Multi-platform</Text>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ unmountOnBlur: true,}}
      >
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="MFE1" component={MFEWrapper1} />
        <Tab.Screen name="MFE2" component={MFEWrapper2} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create( {
  centerContents: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loading: {
    color: 'green',
  },
  mfeContainer: {
    alignItems: 'center',
    borderColor: '#eee',
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'flex',
    height: 60,
    justifyContent: 'center',
    marginVertical: 10,
    width: '90%',
  }
});
