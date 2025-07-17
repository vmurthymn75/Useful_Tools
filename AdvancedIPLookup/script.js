document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const ipInput = document.getElementById('ip-input');
    const lookupBtn = document.getElementById('lookup-btn');
    const errorMessage = document.getElementById('error-message');
    const resultSection = document.getElementById('result-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const ipDetails = document.getElementById('ip-details');
    const copyIpBtn = document.getElementById('copy-ip-btn');
    const shareResultBtn = document.getElementById('share-result-btn');

    let currentIp = '';

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

    // --- IP Info Fetching ---
    const fetchIpInfo = async (ip = '') => {
        errorMessage.classList.add('hidden');
        resultSection.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const apiUrl = `https://ipapi.co/${ip}/json/`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok && !data.error) {
                displayIpInfo(data);
                currentIp = data.ip; // Store the fetched IP
                resultSection.classList.remove('hidden');
            } else {
                showError(data.reason || 'Could not fetch IP information. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching IP info:', error);
            showError('Network error or invalid input. Please check your connection or input.');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    };

    const displayIpInfo = (data) => {
        ipDetails.innerHTML = ''; // Clear previous details

        const fields = [
            { label: 'IP Address', value: data.ip, icon: 'fas fa-globe' },
            { label: 'Hostname', value: data.hostname || 'N/A', icon: 'fas fa-server' },
            { label: 'City', value: data.city || 'N/A', icon: 'fas fa-city' },
            { label: 'Region', value: data.region || 'N/A', icon: 'fas fa-map' },
            { label: 'Country', value: `${data.country_name || 'N/A'} ${getFlagEmoji(data.country_code)}`, icon: 'fas fa-flag' },
            { label: 'Postal Code', value: data.postal || 'N/A', icon: 'fas fa-mail-bulk' },
            { label: 'Latitude', value: data.latitude || 'N/A', icon: 'fas fa-map-pin' },
            { label: 'Longitude', value: data.longitude || 'N/A', icon: 'fas fa-map-pin' },
            { label: 'Organization / ISP', value: data.org || 'N/A', icon: 'fas fa-building' },
            { label: 'ASN', value: data.asn || 'N/A', icon: 'fas fa-network-wired' },
            { label: 'Timezone', value: data.timezone || 'N/A', icon: 'fas fa-clock' }
        ];

        fields.forEach(field => {
            const detailItem = document.createElement('div');
            detailItem.classList.add('detail-item');
            detailItem.innerHTML = `
                <strong><i class="${field.icon}"></i> ${field.label}</strong>
                <span>${field.value}</span>
            `;
            ipDetails.appendChild(detailItem);
        });
    };

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    };

    // --- Input Validation ---
    const isValidIp = (input) => {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/;
        return ipv4Regex.test(input) || ipv6Regex.test(input);
    };

    const isValidDomain = (input) => {
        const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(input);
    };

    const resolveDomainToIp = async (domain) => {
        const dnsApiUrl = `https://dns.google/resolve?name=${domain}&type=A`;
        try {
            const response = await fetch(dnsApiUrl);
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
                // Find the first A record (IPv4 address)
                const ipRecord = data.Answer.find(record => record.type === 1); // Type 1 is A record
                if (ipRecord) {
                    return ipRecord.data;
                }
            }
            return null;
        } catch (error) {
            console.error('Error resolving domain:', error);
            return null;
        }
    };

    // --- Event Listeners ---
    lookupBtn.addEventListener('click', async () => {
        const input = ipInput.value.trim();
        if (input === '') {
            showError('Please enter an IP address or domain name.');
            return;
        }

        let target = input;

        if (isValidIp(input)) {
            // Input is a valid IP, proceed directly
            fetchIpInfo(target);
        } else if (isValidDomain(input)) {
            // Input is a domain, resolve it first
            errorMessage.classList.add('hidden');
            resultSection.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');

            const resolvedIp = await resolveDomainToIp(input);
            if (resolvedIp) {
                target = resolvedIp;
                fetchIpInfo(target);
            } else {
                showError('Domain could not be resolved. Please enter a valid domain or IP address.');
                loadingSpinner.classList.add('hidden');
            }
        } else {
            showError('Invalid IP address or domain name format.');
        }
    });

    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            lookupBtn.click();
        }
    });

    copyIpBtn.addEventListener('click', () => {
        if (currentIp) {
            navigator.clipboard.writeText(currentIp).then(() => {
                alert(`Copied IP: ${currentIp}`);
            }).catch(err => {
                console.error('Failed to copy IP:', err);
                alert('Failed to copy IP.');
            });
        }
    });

    shareResultBtn.addEventListener('click', () => {
        if (currentIp) {
            const shareUrl = `${window.location.origin}${window.location.pathname}?ip=${currentIp}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert(`Shareable URL copied: ${shareUrl}`);
            }).catch(err => {
                console.error('Failed to copy share URL:', err);
                alert('Failed to copy share URL.');
            });
        }
    });

    // --- Initial Load ---
    applySavedTheme();

    // Check for IP in URL parameter for sharing
    const urlParams = new URLSearchParams(window.location.search);
    const ipFromUrl = urlParams.get('ip');
    if (ipFromUrl) {
        // If it's an IP, use it directly. If it's a domain, the lookup button handler will resolve it.
        ipInput.value = ipFromUrl;
        if (isValidIp(ipFromUrl)) {
            fetchIpInfo(ipFromUrl);
        } else if (isValidDomain(ipFromUrl)) {
            // Trigger the lookup button click to handle domain resolution
            lookupBtn.click();
        } else {
            showError('Invalid IP address or domain name in URL.');
            fetchIpInfo(); // Fallback to getting visitor's IP
        }
    } else {
        fetchIpInfo(); // Get visitor's IP on initial load
    }
});