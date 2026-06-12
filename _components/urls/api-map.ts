const SERVER_URLs = {
    AuthServer: 'http://127.0.0.1:8000',
    AMServer: 'http://127.0.0.1:8000',
    QualityServer: 'http://127.0.0.1:8000',
    FinanceServer: 'http://127.0.0.1:8000',
    HRServer: 'http://127.0.0.1:8000',
    MMCServer: 'http://127.0.0.1:8000',
    MerchServer: 'http://127.0.0.1:8000',
    FTPServer: 'http://127.0.0.1:8000',
} as const;

export const API_MAP = {
    FTP: {
        getAttachemnt: (url: string) => 
            `${SERVER_URLs.FTPServer}/${url}`,
    },
    AUTH: {
        getResetPassword: () => `${SERVER_URLs.AuthServer}/api/reset-password`,
        confirmResetPassword: (uid: string, token: string) => `${SERVER_URLs.AuthServer}/reset-password/${uid}/${token}/`,
        getLogin: () => `${SERVER_URLs.AuthServer}/api/login`,
    },
    NAVIGATION: {
        getNaviationBar: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.AMServer}/api/navbar-options`);
            const pageName = searchParams.get('pageName') || '';
            url.searchParams.append('pageName', pageName);

            return url.toString();
        },
    },
    OPTIONS: {
        getCustomers: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.HRServer}/options/customers-api`);
            const allowedKeys = ['search']
            allowedKeys.forEach((key) => {
                const value = searchParams.get(key);
                if (value) url.searchParams.append(key, value);
            });

            return url.toString();
        },
        getDepartments: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.HRServer}/options/departments-api`);
            const allowedKeys = ['search']
            allowedKeys.forEach((key) => {
                const value = searchParams.get(key);
                if (value) url.searchParams.append(key, value);
            });

            return url.toString();
        },
        getInventories: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.MMCServer}/api/inventories?showAll=yes&showUnits=yes`);
            const allowedKeyValues = {search: null, type: '', showAll: 'yes', showUnits: 'yes', limit: 15}

            Object.entries(allowedKeyValues).forEach(([key, defaultValue]) => {
                const value = searchParams.get(key) ?? defaultValue;

                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            });

            return url.toString();
        },
        getPendingPOs: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.MMCServer}/options/purchase-orders-api/pending`);
            const allowedKeyValues = {'search': ''}
            Object.entries(allowedKeyValues).forEach(([key, defaultValue]) => {
                const value = searchParams.get(key) ?? defaultValue;

                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            });
            return url.toString();            
        },
        getStyles: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.MerchServer}/options/styles-api`);
            const allowedKeyValues = {search: null, showCustomer: null}
            Object.entries(allowedKeyValues).forEach(([key, defaultValue]) => {
                const value = searchParams.get(key) ?? defaultValue;

                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            });
            return url.toString();
        },
        getSuppliers: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.MMCServer}/options/suppliers-api`);
            const allowedKeyValues = {search: null} 
            Object.entries(allowedKeyValues).forEach(([key, defaultValue]) => {
                const value = searchParams.get(key) ?? defaultValue;

                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            });

            return url.toString();
        },
        getWorkOrders: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.MerchServer}/options/work-orders`);
            const allowedKeyValues = {search: '', searches: [], extraCols: []};

            Object.keys(allowedKeyValues).forEach((key) => {
                const value = searchParams.get(key) || searchParams.getAll(key);

                if (value && value.length > 0) {
                    if (Array.isArray(value)) {
                        value.forEach(val => url.searchParams.append(key, val));
                    } else {
                        url.searchParams.set(key, value);
                    }
                } else if (allowedKeyValues[key as keyof typeof allowedKeyValues]) {
                    const defaultValue = allowedKeyValues[key as keyof typeof allowedKeyValues];
                    if (typeof defaultValue === 'string' && defaultValue !== '') {
                        url.searchParams.set(key, defaultValue);
                    }
                }
            });

            return url.toString();
        },
        getWorkers: (searchParams: URLSearchParams) => {
            const url = new URL(`${SERVER_URLs.HRServer}/options/workers`);
            const allowedKeys = ['search'];
            allowedKeys.forEach((key) => {
                const value = searchParams.get(key);
                if (value) url.searchParams.append(key, value);
            });
            return url.toString();
        },
    },
    CONSUMPTION: {
        getThreadConsumptionHistory: () => `${SERVER_URLs.AMServer}/consumption/thread`,
        getThreadRequestUpdate: (id: string) => `${SERVER_URLs.AMServer}/consumption/thread/request/${id}/update`,
        getPendingThreadRequests: () => `${SERVER_URLs.AMServer}/consumption/thread/requests/pending`,
    },
    FINANCE: {
        INVENTORY: {
            getInventories: (query: string) => {
                const url = new URL(`${SERVER_URLs.AMServer}/api/inventories`);
                url.searchParams.append('search', query);
                return url.toString();

            },
            getStockStatus: () => `${SERVER_URLs.AMServer}/inventory/stock-report`,
        },
        PURCHASE_ORDER: {
            getPurchaseOrders: (start: string) => {
                const url = new URL(`${SERVER_URLs.FinanceServer}/finance/purchase-order`);
                url.searchParams.append('start', start);
                return url.toString();
            },
            getPurchaseOrder: (id: string) => `${SERVER_URLs.FinanceServer}/finance/purchase-order/${id}`,
        },
    },
    HR: {
        ATTENDANCE: {
            getAttendance: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.HRServer}/hr/attendance`);
                const allowedKeys = ['employeeCode', 'from', 'to'];
                allowedKeys.forEach(key => {
                    const value = searchParams.get(key);
                    if (value) {
                        url.searchParams.append(key, value);
                    }
                });
                return url.toString();
            },
            CORRECTION: {
                getAddCorrection: (searchParams: URLSearchParams) => {
                    const url = new URL(`${SERVER_URLs.HRServer}/hr/attendance/correction/add`);
                    const allowedKeys = ['date', 'type', 'employee'];
                    allowedKeys.forEach(key => {
                        const value = searchParams.get(key);
                        if (value) {
                            url.searchParams.append(key, value);
                        }
                    });
                    return url.toString();
                }
            },
        },
        HOLIDAY: {
            getAddHoliday: () => `${SERVER_URLs.HRServer}/hr/holiday/add`,
        },
        OFFICE: {
            getOffices: () => `${SERVER_URLs.HRServer}/hr/offices`,
            getOfficeUpdate: (id: string) => `${SERVER_URLs.HRServer}/hr/office/${id}/update`,
            getOfficeAdd: () => `${SERVER_URLs.HRServer}/hr/office/add`,
            getOfficeAssign: (employee: string | null) => {
                const url = new URL(`${SERVER_URLs.HRServer}/hr/worker/office-assign`);
                if (employee) url.searchParams.append('employee', employee);
                return url.toString()
            }, 
        },
        WORKER: {
            getWorkers: () => `${SERVER_URLs.HRServer}/hr/workers`,
            getAddWorker: () => `${SERVER_URLs.HRServer}/hr/worker/add`,
            getUpdateWorker: (id: string) => `${SERVER_URLs.HRServer}/hr/worker/${id}/update`,
            getBulkAdd: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.HRServer}/hr/worker/bulk-add`);
                const dryRun = searchParams.get('dry_run');
                if (dryRun) url.searchParams.append('dry_run', dryRun);
                return url.toString();
            },
            getSetSaturday: (searchParams: URLSearchParams | null) => {
                const url = new URL(`${SERVER_URLs.HRServer}/hr/worker/set-saturday`);
                const employee = searchParams?.get('employee');
                if (employee) url.searchParams.append('employee', employee);

                return url.toString()
            },
            getShiftDefine: (searchParams: URLSearchParams | null) => {
                const url = new URL(`${SERVER_URLs.HRServer}/hr/worker/shift-define`);
                const department = searchParams?.get('department');
                if (department) url.searchParams.append('department', department);

                return url.toString();
            }
        }
    },
    MERCHANDISING: {
        INVENTORY: {
            getPendingOrders: (searchParams: URLSearchParams | null) => {
                const url  = new URL(`${SERVER_URLs.MerchServer}/mmc/inventory-orders/pending`);
                const keys = searchParams?.keys() || [];
                keys.forEach((key) => {
                    const value = searchParams?.get(key);
                    if (value) url.searchParams.append(key, value);
                })

                return url.toString();
            },
        },
        STYLE: {
            getStyles: () => `${SERVER_URLs.MerchServer}/merchandising/style`,
            getStyleAdd: () => `${SERVER_URLs.MerchServer}/merchandising/style/add`,
            getStyleUpdate: (code: string) => `${SERVER_URLs.MerchServer}/merchandising/style/${code}/update`,
            getStyleCopy: (code: string) => `${SERVER_URLs.MerchServer}/merchandising/style/${code}/copy`,
            getStyleDelete: (code: string) => `${SERVER_URLs.MerchServer}/merchandising/style/${code}/delete`,
            getStyleRoute: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/merchandising/style/route-preset/details`);
                const routeId = searchParams?.get('routeId');
                if (routeId) url.searchParams.append('routeId', routeId);

                return url.toString();
            }
        },
        WORKORDER: {
            getWorkOrder: () => `${SERVER_URLs.MerchServer}/merchandising/work-order`,
            getWorkOrderAdd: () => `${SERVER_URLs.MerchServer}/merchandising/work-order/add`,
            getWorkOrderUpdate: (id: number) => `${SERVER_URLs.MerchServer}/merchandising/work-order/${id}/update`,
            getWorkOrderDelete: (id: number) => `${SERVER_URLs.MerchServer}/merchandising/work-order/${id}/delete`,
            getRequirementHistory: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/merchandising/work-order/requirement/get`);

                const workOrder = searchParams.get('workOrder');
                const id = searchParams.get('id');

                if (workOrder) url.searchParams.append('orderNumber', workOrder);
                if (id) url.searchParams.append('id', id);
            
                return url.toString();
            },
            getRequirementCalculate: () => `${SERVER_URLs.MerchServer}/merchandising/work-order/requirement/calculate`,
            getVariantsCalculate: (style: string) => `${SERVER_URLs.MerchServer}/merchandising/work-order/variants/calculate?styleCode=${style}`
        },
    },
    MMC: {
        INVENTORY: {
            getInventory: () => `${SERVER_URLs.MMCServer}/mmc/inventory`,
            getInventoryAdd: () => `${SERVER_URLs.MMCServer}/mmc/inventory/add`,
            getInventoryUpdate: (code: string) => `${SERVER_URLs.MMCServer}/mmc/inventory/${code}/update`,
            getInventoryCopy: (code: string) => `${SERVER_URLs.MMCServer}/mmc/inventory/${code}/copy`,
            getInventoryDelete: (code: string) => `${SERVER_URLs.MMCServer}/mmc/inventory/${code}/delete`,

            getCodeCheck: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/mmc/inventory/code-check`);
                const keys = searchParams?.keys();
                keys.forEach((key) => {
                    const value = searchParams?.get(key);
                    if (value) url.searchParams.append(key, value);
                })

                return url.toString();
            },
            getCodeGenerator: () => `${SERVER_URLs.MMCServer}/mmc/inventory/code-gen`,

            getUnits: (searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/api/units`);
                const keys = searchParams.keys();
                keys.forEach((key) => {
                    const value = searchParams?.get(key);
                    if (value) url.searchParams.append(key, value);
                })

                return url.toString();
            },
        },
        INVENTORY_RECEIPT: {
            getReceipts: () => `${SERVER_URLs.MMCServer}/mmc/inventory-receipt`,
            getReceiptAdd: () => `${SERVER_URLs.MMCServer}/mmc/inventory-receipt/add`,
            getReceiptUpdate: (id: number) => `${SERVER_URLs.MMCServer}/mmc/inventory-receipt/${id}/update`,
            getReceiptReallocate: (id: number, searchParams: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/mmc/inventory-receipt/${id}/re-allocate`);
                const keys = searchParams.keys();
                keys.forEach((key) => {
                    const value = searchParams?.get(key);
                    if (value) url.searchParams.append(key, value);
                })
                return url.toString();
            },
        },
        INVENTORY_ISSUANCE: {
            getIssuances: () => `${SERVER_URLs.MMCServer}/mmc/issuance`,
            getIssueSamplingAdd: () => `${SERVER_URLs.MMCServer}/mmc/issuance/add-sampling`,
            getIssueInventoryAdd: (searchParams?: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/mmc/issuance/add-inventory`);

                url.search = searchParams?.toString() || '';

                return url.toString();
            },
            getIssueOrderAdd: (searchParams?: URLSearchParams) => {
                const url = new URL(`${SERVER_URLs.MMCServer}/mmc/issuance/add-order`);

                url.search = searchParams?.toString() || '';

                return url.toString();
            },
        },
    },
} as const;