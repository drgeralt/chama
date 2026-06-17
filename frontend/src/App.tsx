import React from 'react';
import { IonApp, setupIonicReact, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

//Core CSS do Ionic (Reset base deles)
import '@ionic/react/css/core.css';
import '@ionic/react/css/structure.css';



import './index.css';

// Import Components/Features
import Login from './features/auth/ui/Login';
import OrgSelector from './features/organizations/ui/OrgSelector';
import OrgCreatePage from './features/organizations/ui/OrgCreatePage';
import TicketList from './features/tickets/ui/TicketList';
import TicketDetail from './features/tickets/ui/TicketDetail';
import TicketCreatePage from './features/tickets/ui/TicketCreatePage';
import Dashboard from './features/dashboard/ui/Dashboard';
import MyDay from './features/dashboard/ui/MyDay';
import Settings from './features/settings/ui/Settings';
import Register from './features/auth/ui/Register';
import ForgotPassword from './features/auth/ui/ForgotPassword';
import InvitePage from './features/auth/ui/InvitePage';

setupIonicReact({ mode: 'md' });

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/invite/:id" component={InvitePage} />
          <Route exact path="/organizations" component={OrgSelector} />
          <Route exact path="/organizations/new" component={OrgCreatePage} />
          <Route exact path="/dashboard/general" component={Dashboard} />
          <Route exact path="/dashboard/tickets" component={TicketList} />
          <Route exact path="/dashboard/my-day" component={MyDay} />
          <Route exact path="/dashboard/settings" component={Settings} />
          <Route exact path="/new-ticket" component={TicketCreatePage} />
          <Route exact path="/tickets/:id" component={TicketDetail} />
          <Route exact path="/" render={() => <Redirect to="/login" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </QueryClientProvider>
);

export default App;