import { Injectable, computed, signal } from '@angular/core';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private accountSignal = signal<string | null>(null);
  private chainIdSignal = signal<string | null>(null);
  private connectedSignal = signal(false);

  account = computed(() => this.accountSignal());
  chainId = computed(() => this.chainIdSignal());
  isConnected = computed(() => this.connectedSignal());
  hasMetaMask = computed(
    () => typeof window !== 'undefined' && !!window.ethereum
  );

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.setupListeners();
      this.checkExistingConnection();
    }
  }

  private setupListeners() {
    window.ethereum.on?.('accountsChanged', (accounts: string[]) => {
      if (accounts?.length) {
        this.accountSignal.set(accounts[0]);
        this.connectedSignal.set(true);
      } else {
        this.accountSignal.set(null);
        this.connectedSignal.set(false);
      }
    });

    window.ethereum.on?.('chainChanged', (chainId: string) => {
      this.chainIdSignal.set(chainId);
    });
  }

  async checkExistingConnection() {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts?.length) {
        this.accountSignal.set(accounts[0]);
        this.connectedSignal.set(true);
      } else {
        this.accountSignal.set(null);
        this.connectedSignal.set(false);
      }

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      this.chainIdSignal.set(chainId);
    } catch (error) {
      console.error('MetaMask check failed:', error);
    }
  }

  async connectWallet(forceSelect = false): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    if (forceSelect) {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts?.length) {
      throw new Error('No account returned from MetaMask');
    }

    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    this.accountSignal.set(accounts[0]);
    this.connectedSignal.set(true);
    this.chainIdSignal.set(chainId);

    return accounts[0];
  }

  async disconnectWallet() {
    this.accountSignal.set(null);
    this.connectedSignal.set(false);
  }

  async switchToHardhat() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      });
    } catch (error: any) {
      if (error?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: [],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  async getBrowserProvider(): Promise<BrowserProvider> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    return new BrowserProvider(window.ethereum);
  }

  async getSigner(): Promise<JsonRpcSigner> {
    const provider = await this.getBrowserProvider();
    return provider.getSigner();
  }
}