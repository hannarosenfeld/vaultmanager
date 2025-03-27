import React, { useState } from 'react';

function VaultForm() {
    const [customerName, setCustomerName] = useState('');
    const [vaultNumber, setVaultNumber] = useState('');
    const isVaultNumberDisabled = customerName === "EMPTY LIFTVAN" || customerName === "EMPTY T2";

    return (
        <form>
            <label htmlFor="customerName">Customer Name</label>
            <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
            />

            <label htmlFor="vaultNumber">Vault Number</label>
            <input
                id="vaultNumber"
                type="text"
                value={vaultNumber}
                onChange={(e) => setVaultNumber(e.target.value)}
                disabled={isVaultNumberDisabled}
                style={{ backgroundColor: isVaultNumberDisabled ? 'gray' : 'white' }}
            />
        </form>
    );
}

export default VaultForm;