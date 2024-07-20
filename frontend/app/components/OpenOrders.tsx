import { useState } from 'react';
import { OpenOrder } from "../utils/types";
import NoOpenOrder from "./NoOpenOrders";
import { deleteOpenOrder } from '../utils/httpClient';
import toast, { Toaster } from 'react-hot-toast';

const OpenOrders = ({openOrders, market,handleOrderDelete}: {openOrders: OpenOrder[], market: string,handleOrderDelete:(orderId:string)=>void}) => {
    const [selectedOrder, setSelectedOrder] = useState<OpenOrder | null>(null);
    
    if (!openOrders || openOrders.length == 0) {
        return <NoOpenOrder />
    }

    const handleOrderClick = (order: OpenOrder) => {
        setSelectedOrder(order);
    };

    const handleDeleteConfirm = async () => {
      if (selectedOrder) {
          const result = await deleteOpenOrder(selectedOrder.orderId, market);
          if ('err' in result) {
              toast.error(`Failed to delete order: ${result.err}`, {
                  duration: Infinity,
                  position: 'bottom-right',
                  style: {
                      background: '#0e0f14',
                      color: '#ffffff',
                  },
              });
          } else {
              
              toast((t) => (
                  <div className="text-white p-0.5">
                      <p className='m-1'>Order {result.orderId} deleted:</p>
                      <p className='m-1'>Executed Qty: <span className='font-bold'>{result.executedQty}</span></p>
                      <p className='m-1'>Remaining Qty: {result.remainingQty}</p>
                      <button
                          onClick={() => toast.dismiss(t.id)}
                          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                          Dismiss
                      </button>
                  </div>
              ), {
                  duration: Infinity,
                  position: 'bottom-right',
                  style: {
                      background: '#3D3E42',
                      color: '#ffffff',
                  },
              });
              handleOrderDelete(result.orderId)
          }
      }
      
      setSelectedOrder(null);
  };

    return (
        <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full" data-v0-t="card">
                <div className="flex flex-col space-y-1.5 p-6 px-7">
                    <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">Open Orders</h3>
                    <p className="text-sm text-muted-foreground">Market : {market}</p>
                </div>
                <div className="p-6">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&amp;_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Order Id
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Type
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Price
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Quantity
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Total
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                                        Executed Qty.
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&amp;_tr:last-child]:border-0">               
                            {openOrders.map((openOrder) => (
                                <tr 
                                    key={openOrder.orderId} 
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/20 cursor-pointer"
                                    onClick={() => handleOrderClick(openOrder)}
                                >                  
                                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{openOrder.orderId}</td>
                                    <td className={`p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 ${openOrder.side=="buy"?"text-green-500":"text-red-500"}`}>{openOrder.side}</td>
                                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{openOrder.price}</td>
                                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{openOrder.quantity}</td>
                                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{Number(openOrder.price)*Number(openOrder.quantity)}</td>
                                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{openOrder.executedQty || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-baseColor p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p>Are you sure you want to delete order {selectedOrder.orderId}?</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 text-black bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster />
        </>
    );
}

export default OpenOrders;