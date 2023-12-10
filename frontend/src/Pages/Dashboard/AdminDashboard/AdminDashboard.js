import React, { useState, useCallback } from 'react'
import './AdminDashboard.css';
import AddTransaction from './Components/AddTransaction';
import AddMember from './Components/AddMember';
import AddBook from './Components/AddBook';
import AddCategory from './Components/AddCategory';
import ManageBook from './Components/ManageBook';
import ManageMember from './Components/ManageMember';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import BookIcon from '@material-ui/icons/Book';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CategoryIcon from '@material-ui/icons/Category';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import GetMember from './Components/GetMember';
import AssignmentReturnIcon from '@material-ui/icons/AssignmentReturn';
import Return from './Components/Return';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import Profile from './Components/Profile';
import ManageBookIcon from '@material-ui/icons/CollectionsBookmark';
import ManageAccountsIcon from '@material-ui/icons/Group';

const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css';
document.head.appendChild(styleLink);

function AdminDashboard() {
  const [active, setActive] = useState('profile');
  const [sidebar, setSidebar] = useState(false);
  const [isRefreshNeeded1, setRefreshNeeded1] = useState(false);
  const [isRefreshNeeded2, setRefreshNeeded2] = useState(false);
  const [isRefreshNeeded3, setRefreshNeeded3] = useState(false);
  const [isRefreshNeeded4, setRefreshNeeded4] = useState(false);
  const [isRefreshNeeded5, setRefreshNeeded5] = useState(false);
  const [isRefreshNeeded6, setRefreshNeeded6] = useState(false);
  const [isRefreshNeeded7, setRefreshNeeded7] = useState(false);

  const handleRefresh1 = useCallback(() => {
    setRefreshNeeded1(true);
  }, []);

  const handleRefresh2 = useCallback(() => {
    setRefreshNeeded2(true);
  }, []);

  const handleRefresh3 = useCallback(() => {
    setRefreshNeeded3(true);
  }, []);

  const handleRefresh4 = useCallback(() => {
    setRefreshNeeded4(true);
  }, []);

  const handleRefresh5 = useCallback(() => {
    setRefreshNeeded5(true);
  }, []);

  const handleRefresh6 = useCallback(() => {
    setRefreshNeeded6(true);
  }, []);

  const handleRefresh7 = useCallback(() => {
    setRefreshNeeded7(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="sidebar-toggler" onClick={() => setSidebar(!sidebar)}>
          <IconButton>
            {sidebar ? (
              <CloseIcon style={{ fontSize: 25, color: 'grey' }} />
            ) : (
              <DoubleArrowIcon style={{ fontSize: 25, color: 'grey' }} />
            )}
          </IconButton>
        </div>

        <div className={sidebar ? 'dashboard-options active' : 'dashboard-options'}>
          <div className="dashboard-logo">
            <LibraryBooksIcon style={{ fontSize: 50 }} />
            <p className="logo-name">Project-LMS</p>
          </div>
          <p
            className={`dashboard-option ${active === 'profile' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('profile');
              setSidebar(false);
            }}
          >
            <AccountCircleIcon className="dashboard-option-icon" /> Profile
          </p>
          <p
            className={`dashboard-option ${active === 'addbook' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('addbook');
              setSidebar(false);
            }}
          >
            <BookIcon className="dashboard-option-icon" /> Add Book
          </p>
          <p
            className={`dashboard-option ${active === 'managebook' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('managebook');
              setSidebar(false);
            }}
          >
            <ManageBookIcon className="dashboard-option-icon" /> Manage Book
          </p>
          <p
            className={`dashboard-option ${active === 'addCategory' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('addCategory');
              setSidebar(false);
            }}
          >
            <CategoryIcon className="dashboard-option-icon" /> Add Book <br /> categories
          </p>
          <p
            className={`dashboard-option ${active === 'addtransaction' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('addtransaction');
              setSidebar(false);
            }}
          >
            <ReceiptIcon className="dashboard-option-icon" /> Add Transaction
          </p>
          <p
            className={`dashboard-option ${active === 'getmember' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('getmember');
              setSidebar(false);
            }}
          >
            <AccountBoxIcon className="dashboard-option-icon" /> Get Member
          </p>
          <p
            className={`dashboard-option ${active === 'addmember' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('addmember');
              setSidebar(false);
            }}
          >
            <PersonAddIcon className="dashboard-option-icon" /> Add Member
          </p>
          <p
            className={`dashboard-option ${active === 'managemember' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('managemember');
              setSidebar(false);
            }}
          >
            <ManageAccountsIcon className="dashboard-option-icon" /> Manage Member
          </p>
          <p
            className={`dashboard-option ${active === 'returntransaction' ? 'clicked' : ''}`}
            onClick={() => {
              setActive('returntransaction');
              setSidebar(false);
            }}
          >
            <AssignmentReturnIcon className="dashboard-option-icon" /> Return
          </p>
          <p className="dashboard-option" onClick={logout}>
            <PowerSettingsNewIcon className="dashboard-option-icon" /> Log out
          </p>
          <p style={{ color: 'transparent', padding: '15px' }}></p>
          <p style={{ color: 'transparent', padding: '15px' }}></p>
        </div>
        <div className="dashboard-option-content">
          <div className="dashboard-addbooks-content" style={active !== 'profile' ? { display: 'none' } : {}}>
            <Profile onProfileEdited={handleRefresh6}/>
          </div>
          <div className="dashboard-addbooks-content" style={active !== 'addCategory' ? { display: 'none' } : {}}>
            <AddCategory onCategoryAdded={handleRefresh1}/>
          </div>
          <div className="dashboard-addbooks-content" style={active !== 'addbook' ? { display: 'none' } : {}}>
            <AddBook onBookAdded={handleRefresh2} refresh1={isRefreshNeeded1} refresh3={isRefreshNeeded3}/>
          </div>
          <div className="dashboard-addbooks-content" style={active !== 'managebook' ? { display: 'none' } : {}}>
            <ManageBook onBookEdited={handleRefresh3} refresh1={isRefreshNeeded1} refresh2={isRefreshNeeded2}/>
          </div>
          <div className="dashboard-transactions-content" style={active !== 'addtransaction' ? { display: 'none' } : {}}>
            <AddTransaction onTransactionAdded={handleRefresh4} refresh2={isRefreshNeeded2} refresh3={isRefreshNeeded3} refresh5={isRefreshNeeded5} refresh6={isRefreshNeeded6} refresh7={isRefreshNeeded7}/>
          </div>
          <div className="dashboard-addmember-content" style={active !== 'addmember' ? { display: 'none' } : {}}>
            <AddMember onMemberAdded={handleRefresh5} refresh6={isRefreshNeeded6}/>
          </div>
          <div className="dashboard-addmember-content" style={active !== 'managemember' ? { display: 'none' } : {}}>
            <ManageMember onMemberEdited={handleRefresh6} refresh5={isRefreshNeeded5}/>
          </div>
          <div className="dashboard-addmember-content" style={active !== 'getmember' ? { display: 'none' } : {}}>
            <GetMember refresh4={isRefreshNeeded4} refresh5={isRefreshNeeded5} refresh6={isRefreshNeeded6}/>
          </div>
          <div className="dashboard-addmember-content" style={active !== 'returntransaction' ? { display: 'none' } : {}}>
            <Return onReturn={handleRefresh7} refresh4={isRefreshNeeded4}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
