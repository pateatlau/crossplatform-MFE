import React from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { loadComponent } from './utils/loadComponent';

function RemoteApp(props) {
  const {
    params,
    params: { remote, url, module, appNumber },
  } = props;

  if (!params || !remote || !url || !module) {
    return <h2>Invalid params for loading MFE</h2>;
  }

  const Component = React.lazy(loadComponent(remote, 'default', module, url));

  return (
    <ErrorBoundary fallback={
      <div style={{
        color: 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {`Something went wrong while loading remote MFE ${appNumber}`}
      </div>
    }>
      <React.Suspense fallback={
      <div style={{
        color: 'green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
          {`Loading remote MFE ${appNumber}...`}
        </div>
      }>
        <Component />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <div
      style={{
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <h1 style={{ fontSize: 28, }}>Web Host</h1>
      <div style={{
        border: '1px solid #eee',
        padding: '20px',
        margin: '10px',
        width: '90%',
      }}>
        <RemoteApp params={
          {
            remote: 'app1',
            url: 'http://localhost:9000/app1.container.bundle?platform=web',
            module: './App.js',
            appNumber: 1,
          }
        } />
      </div>
      <div style={{
        border: '1px solid #eee',
        padding: '20px',
        margin: '10px',
        width: '90%',
      }}>
        <RemoteApp params={
          {
            remote: 'app2',
            url: 'http://localhost:9001/app2.container.bundle?platform=web',
            module: './App.js',
            appNumber: 2,
          }
        } />
      </div>
    </div>
  );
}

export default App;
