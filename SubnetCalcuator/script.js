document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const ipAddressInput = document.getElementById('ip-address');
    const subnetMaskInput = document.getElementById('subnet-mask');
    const calculateBtn = document.getElementById('calculate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorMessage = document.getElementById('error-message');
    const resultSection = document.getElementById('result-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const networkDetails = document.getElementById('network-details');

    // --- Theme Toggle ---
    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(savedTheme + '-mode');
        if (savedTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // --- Validation Functions ---
    const isValidIp = (ip) => {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ip);
    };

    const isValidSubnetMask = (mask) => {
        const parts = mask.split('.');
        if (parts.length !== 4) return false;
        const binary = parts.map(p => parseInt(p).toString(2).padStart(8, '0')).join('');
        return /^(1+0*)$/.test(binary);
    };

    const isValidCidr = (cidr) => {
        const num = parseInt(cidr);
        return !isNaN(num) && num >= 0 && num <= 32;
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        resultSection.classList.add('hidden');
    };

    const clearError = () => {
        errorMessage.classList.add('hidden');
    };

    // --- IP Conversion Functions ---
    const ipToBinary = (ip) => {
        return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
    };

    const binaryToIp = (binary) => {
        const octets = [];
        for (let i = 0; i < 32; i += 8) {
            octets.push(parseInt(binary.substring(i, i + 8), 2));
        }
        return octets.join('.');
    };

    const cidrToMask = (cidr) => {
        const ones = '1'.repeat(cidr);
        const zeros = '0'.repeat(32 - cidr);
        return binaryToIp(ones + zeros);
    };

    const maskToCidr = (mask) => {
        const binary = ipToBinary(mask);
        return binary.indexOf('0');
    };

    // --- Calculation Functions ---
    const calculateSubnet = () => {
        clearError();
        loadingSpinner.classList.remove('hidden');
        resultSection.classList.add('hidden');
        networkDetails.innerHTML = '';

        const ipAddress = ipAddressInput.value.trim();
        let subnetMask = subnetMaskInput.value.trim();
        let cidr = 0;

        if (!isValidIp(ipAddress)) {
            showError('Invalid IP Address format.');
            loadingSpinner.classList.add('hidden');
            return;
        }

        if (subnetMask.startsWith('/')) {
            cidr = parseInt(subnetMask.substring(1));
            if (!isValidCidr(cidr)) {
                showError('Invalid CIDR format. Must be between /0 and /32.');
                loadingSpinner.classList.add('hidden');
                return;
            }
            subnetMask = cidrToMask(cidr);
        } else {
            if (!isValidSubnetMask(subnetMask)) {
                showError('Invalid Subnet Mask format.');
                loadingSpinner.classList.add('hidden');
                return;
            }
            cidr = maskToCidr(subnetMask);
        }

        const ipBinary = ipToBinary(ipAddress);
        const maskBinary = ipToBinary(subnetMask);

        const networkBinary = (parseInt(ipBinary, 2) & parseInt(maskBinary, 2)).toString(2).padStart(32, '0');
        const networkAddress = binaryToIp(networkBinary);

        const wildcardBinary = maskBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
        const wildcardMask = binaryToIp(wildcardBinary);

        const broadcastBinary = (parseInt(networkBinary, 2) | parseInt(wildcardBinary, 2)).toString(2).padStart(32, '0');
        const broadcastAddress = binaryToIp(broadcastBinary);

        const totalHosts = Math.pow(2, (32 - cidr));
        const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

        let firstUsableIp = 'N/A';
        let lastUsableIp = 'N/A';

        if (usableHosts > 0) {
            const networkOctets = networkAddress.split('.').map(Number);
            networkOctets[3]++;
            firstUsableIp = networkOctets.join('.');

            const broadcastOctets = broadcastAddress.split('.').map(Number);
            broadcastOctets[3]--;
            lastUsableIp = broadcastOctets.join('.');
        }

        const getIpClass = (ip) => {
            const firstOctet = parseInt(ip.split('.')[0]);
            if (firstOctet >= 1 && firstOctet <= 126) return 'A';
            if (firstOctet >= 128 && firstOctet <= 191) return 'B';
            if (firstOctet >= 192 && firstOctet <= 223) return 'C';
            if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
            if (firstOctet >= 240 && firstOctet <= 255) return 'E (Experimental)';
            return 'N/A';
        };

        const isPrivateIp = (ip) => {
            const parts = ip.split('.').map(Number);
            // Class A private: 10.0.0.0 - 10.255.255.255
            if (parts[0] === 10) return true;
            // Class B private: 172.16.0.0 - 172.31.255.255
            if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
            // Class C private: 192.168.0.0 - 192.168.255.255
            if (parts[0] === 192 && parts[1] === 168) return true;
            return false;
        };

        const ipClass = getIpClass(ipAddress);
        const ipType = isPrivateIp(ipAddress) ? 'Private' : 'Public';

        const results = [
            { label: 'IP Address', value: ipAddress, icon: 'fas fa-globe' },
            { label: 'Subnet Mask', value: `${subnetMask} (/${cidr})`, icon: 'fas fa-mask' },
            { label: 'Network Address', value: networkAddress, icon: 'fas fa-network-wired' },
            { label: 'Broadcast Address', value: broadcastAddress, icon: 'fas fa-broadcast-tower' },
            { label: 'First Usable IP', value: firstUsableIp, icon: 'fas fa-arrow-alt-circle-right' },
            { label: 'Last Usable IP', value: lastUsableIp, icon: 'fas fa-arrow-alt-circle-left' },
            { label: 'Total Hosts', value: totalHosts, icon: 'fas fa-users' },
            { label: 'Usable Hosts', value: usableHosts, icon: 'fas fa-user-check' },
            { label: 'Wildcard Mask', value: wildcardMask, icon: 'fas fa-hat-wizard' },
            { label: 'IP Class', value: ipClass, icon: 'fas fa-sitemap' },
            { label: 'IP Type', value: ipType, icon: 'fas fa-shield-alt' },
            { label: 'IP Binary', value: ipToBinary(ipAddress).match(/.{1,8}/g).join(' '), icon: 'fas fa-code' },
            { label: 'Mask Binary', value: ipToBinary(subnetMask).match(/.{1,8}/g).join(' '), icon: 'fas fa-code' }
        ];

        results.forEach(item => {
            const detailItem = document.createElement('div');
            detailItem.classList.add('detail-item');
            detailItem.innerHTML = `
                <strong><i class="${item.icon}"></i> ${item.label}</strong>
                <span>${item.value}</span>
            `;
            networkDetails.appendChild(detailItem);
        });

        loadingSpinner.classList.add('hidden');
        resultSection.classList.remove('hidden');
    };

    // --- Clear Function ---
    const clearInputs = () => {
        ipAddressInput.value = '';
        subnetMaskInput.value = '';
        clearError();
        resultSection.classList.add('hidden');
        networkDetails.innerHTML = '';
    };

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateSubnet);
    clearBtn.addEventListener('click', clearInputs);

    ipAddressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateSubnet();
    });
    subnetMaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateSubnet();
    });

    // --- Initial Load ---
    applySavedTheme();
});
