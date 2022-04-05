import { BrowserRouter, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';
import MainStats from './components/Statistics/MainStats';
import Navbar from './components/Base/Navbar/Navbar';
import Categories from './components/Categories/Categories';
import AuthContext, { extractUser, getToken, getCurrencyRates } from './context/AuthContext';
import { useEffect, useState, useContext } from 'react';
import LogInPage from './components/Auth/LogInPage';
import RegisterPage from './components/Auth/RegisterPage';
import 'bootstrap/dist/css/bootstrap.css';
import Balances from './components/Balances/Balances';
import BalanceTypes from './components/BalanceTypes/BalanceTypes';
import Budgets from './components/Budgets/Budgets';
import httpProvider from './providers/httpProvider';
import { BASE_URL } from './common/constants';
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard';
import AllFeedback from './components/Admin/AllFeedback/AllFeedback';
import AdminNavbar from './components/Admin/AdminNavbar/AdminNavbar';
import Users from './components/Admin/Users/Users';
import FeedbackForm from './components/FeebackForm/FeedbackForm';
import UserProfile from './components/UserProfile/UserProfile';

function App() {

  const [authValue, setAuthValue] = useState({
    isLoggedIn: !!extractUser(getToken()),
    user: extractUser(getToken()),
    currency_rates: getCurrencyRates()
  });

  const history = useHistory();
  useEffect(() => {
    if (new Date(authValue.user?.exp * 1000) <= new Date()) {
      httpProvider.deleteReq(`${BASE_URL}/auth/signout`, {}).then((data) => console.log(data));
      setAuthValue({
        isLoggedIn: false,
        user: null,
      });
      localStorage.removeItem('token');
    }
  }, [authValue.user?.exp, history]);

  return (
    <div className='App'>
      <BrowserRouter>
        <AuthContext.Provider value={{ ...authValue, setLoginState: setAuthValue }}>
          {!authValue.isLoggedIn && (
            <Switch>
              <Redirect path='/' exact to='signin' />
              <Route path='/signin' exact component={LogInPage} />
              <Route path='/signup' exact component={RegisterPage} />
              <Route path='*' component={LogInPage}>
                <Redirect to='/signin' />
              </Route>
            </Switch>
          )}
          {authValue.user && authValue.user.role === 'basic' && (
            <div>
              <Navbar />
              <Switch>
                <Redirect path='/' exact to='dashboard' />
                <Route path='/dashboard' component={Dashboard} />
                <Redirect path='/statistics' exact to='statistics/daily-table' />
                <Route path='/statistics' component={MainStats} />
                <Route path='/categories' component={Categories} />
                <Route path='/balances' component={Balances} />
                <Route path='/balance-types' component={BalanceTypes} />
                <Route path='/budgets' component={Budgets} />
                <Route path='/feedback' component={FeedbackForm} />
                <Route path='/edit-profile' component={UserProfile} />
                <Route path='*' component={Dashboard}>
                  <Redirect to='/dashboard' />
                </Route>
              </Switch>
            </div>
          )}
          {authValue.user && authValue.user.role === 'admin' && (
            <div>
              <AdminNavbar />
              <Switch>
                <Redirect path='/' exact to='/dashboard' />
                <Route path='/dashboard' component={AdminDashboard} />
                <Route path='/all-feedback' component={AllFeedback} />
                <Route path='/users' component={Users} />
                <Route path='*' component={AdminDashboard}>
                  <Redirect to='/dashboard' />
                </Route>
              </Switch>
            </div>
          )}
        </AuthContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
