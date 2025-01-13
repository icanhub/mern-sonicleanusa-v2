import React, { useEffect } from 'react';
import SalesChart from '../../components/SalesChart';
import AmountChart from '../../components/AmountChart';
import OrderFilterTable from '../../components/OrderFilterTable';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import Statistics from '../../components/Statistics';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderHistoryList } from '../../reducers/OrderHistory';
import { isPending } from '../../utils/state';

const AdminDashboard = () => {
  const getting_orderlist_state = useSelector(
    state => state.orderhistory.getting_orderlist_state
  );
  const orderhistorylist = useSelector(
    state => state.orderhistory.orderhistorylist
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrderHistoryList());
  }, []);
  console.log('order history list', orderhistorylist);
  return (
    <div className="animated fadeIn">
      {isPending(getting_orderlist_state) ? (
        <LoadingIndicator />
      ) : (
        <>
          <Statistics orderhistory={orderhistorylist} />
          <SalesChart orderhistory={orderhistorylist} />
          <AmountChart orderhistory={orderhistorylist} />
          <OrderFilterTable orderhistory={orderhistorylist} />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
