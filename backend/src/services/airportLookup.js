/**
 * Airport Lookup Service
 * Provides conversion between airport names, cities, and ICAO codes
 */

// Comprehensive airport database with major airports worldwide
const AIRPORT_DATABASE = {
  // North America - US
  'KJFK': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', iata: 'JFK' },
  'KLGA': { name: 'LaGuardia Airport', city: 'New York', country: 'USA', iata: 'LGA' },
  'KEWR': { name: 'Newark Liberty International Airport', city: 'Newark', country: 'USA', iata: 'EWR' },
  'KLAX': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', iata: 'LAX' },
  'KSFO': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', iata: 'SFO' },
  'KORD': { name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', iata: 'ORD' },
  'KDFW': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', iata: 'DFW' },
  'KATL': { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', iata: 'ATL' },
  'KMIA': { name: 'Miami International Airport', city: 'Miami', country: 'USA', iata: 'MIA' },
  'KSEA': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', iata: 'SEA' },
  'KBOS': { name: 'Logan International Airport', city: 'Boston', country: 'USA', iata: 'BOS' },
  'KPHX': { name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', iata: 'PHX' },
  'KLAS': { name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA', iata: 'LAS' },
  'KIAH': { name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'USA', iata: 'IAH' },
  'KMSP': { name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'USA', iata: 'MSP' },
  'KDTW': { name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'USA', iata: 'DTW' },
  'KPHL': { name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'USA', iata: 'PHL' },
  'KBWI': { name: 'Baltimore/Washington International Thurgood Marshall Airport', city: 'Baltimore', country: 'USA', iata: 'BWI' },
  'KDCA': { name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'USA', iata: 'DCA' },
  'KIAD': { name: 'Washington Dulles International Airport', city: 'Washington', country: 'USA', iata: 'IAD' },
  'KMDW': { name: 'Chicago Midway International Airport', city: 'Chicago', country: 'USA', iata: 'MDW' },
  'KSTL': { name: 'St. Louis Lambert International Airport', city: 'St. Louis', country: 'USA', iata: 'STL' },
  'KCLT': { name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'USA', iata: 'CLT' },
  'KTPA': { name: 'Tampa International Airport', city: 'Tampa', country: 'USA', iata: 'TPA' },
  'KMCO': { name: 'Orlando International Airport', city: 'Orlando', country: 'USA', iata: 'MCO' },
  'KPDX': { name: 'Portland International Airport', city: 'Portland', country: 'USA', iata: 'PDX' },
  'KSLC': { name: 'Salt Lake City International Airport', city: 'Salt Lake City', country: 'USA', iata: 'SLC' },
  'KMSY': { name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', country: 'USA', iata: 'MSY' },
  'KCVG': { name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', country: 'USA', iata: 'CVG' },
  'KIND': { name: 'Indianapolis International Airport', city: 'Indianapolis', country: 'USA', iata: 'IND' },
  'KCMH': { name: 'John Glenn Columbus International Airport', city: 'Columbus', country: 'USA', iata: 'CMH' },
  'KPIT': { name: 'Pittsburgh International Airport', city: 'Pittsburgh', country: 'USA', iata: 'PIT' },
  'KCLE': { name: 'Cleveland Hopkins International Airport', city: 'Cleveland', country: 'USA', iata: 'CLE' },
  'KBNA': { name: 'Nashville International Airport', city: 'Nashville', country: 'USA', iata: 'BNA' },
  'KMEM': { name: 'Memphis International Airport', city: 'Memphis', country: 'USA', iata: 'MEM' },
  'KJAX': { name: 'Jacksonville International Airport', city: 'Jacksonville', country: 'USA', iata: 'JAX' },
  'KRDU': { name: 'Raleigh-Durham International Airport', city: 'Raleigh', country: 'USA', iata: 'RDU' },
  'KRSW': { name: 'Southwest Florida International Airport', city: 'Fort Myers', country: 'USA', iata: 'RSW' },
  'KSMF': { name: 'Sacramento International Airport', city: 'Sacramento', country: 'USA', iata: 'SMF' },
  'KSJC': { name: 'Norman Y. Mineta San Jose International Airport', city: 'San Jose', country: 'USA', iata: 'SJC' },
  'KOAK': { name: 'Oakland International Airport', city: 'Oakland', country: 'USA', iata: 'OAK' },
  'KONT': { name: 'Ontario International Airport', city: 'Ontario', country: 'USA', iata: 'ONT' },
  'KBUR': { name: 'Hollywood Burbank Airport', city: 'Burbank', country: 'USA', iata: 'BUR' },
  'KSNA': { name: 'John Wayne Airport', city: 'Santa Ana', country: 'USA', iata: 'SNA' },
  'KABQ': { name: 'Albuquerque International Sunport', city: 'Albuquerque', country: 'USA', iata: 'ABQ' },
  'KTUS': { name: 'Tucson International Airport', city: 'Tucson', country: 'USA', iata: 'TUS' },
  'KELP': { name: 'El Paso International Airport', city: 'El Paso', country: 'USA', iata: 'ELP' },
  'KOKC': { name: 'Will Rogers World Airport', city: 'Oklahoma City', country: 'USA', iata: 'OKC' },
  'KTUL': { name: 'Tulsa International Airport', city: 'Tulsa', country: 'USA', iata: 'TUL' },
  'KOMA': { name: 'Eppley Airfield', city: 'Omaha', country: 'USA', iata: 'OMA' },
  'KDSM': { name: 'Des Moines International Airport', city: 'Des Moines', country: 'USA', iata: 'DSM' },
  'KMCI': { name: 'Kansas City International Airport', city: 'Kansas City', country: 'USA', iata: 'MCI' },
  'KSTL': { name: 'St. Louis Lambert International Airport', city: 'St. Louis', country: 'USA', iata: 'STL' },
  'KMKE': { name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', country: 'USA', iata: 'MKE' },
  'KGRR': { name: 'Gerald R. Ford International Airport', city: 'Grand Rapids', country: 'USA', iata: 'GRR' },
  'KBUF': { name: 'Buffalo Niagara International Airport', city: 'Buffalo', country: 'USA', iata: 'BUF' },
  'KROC': { name: 'Greater Rochester International Airport', city: 'Rochester', country: 'USA', iata: 'ROC' },
  'KSYR': { name: 'Syracuse Hancock International Airport', city: 'Syracuse', country: 'USA', iata: 'SYR' },
  'KALB': { name: 'Albany International Airport', city: 'Albany', country: 'USA', iata: 'ALB' },
  'KBDL': { name: 'Bradley International Airport', city: 'Hartford', country: 'USA', iata: 'BDL' },
  'KPVD': { name: 'T.F. Green Airport', city: 'Providence', country: 'USA', iata: 'PVD' },
  'KBGR': { name: 'Bangor International Airport', city: 'Bangor', country: 'USA', iata: 'BGR' },
  'KANC': { name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', country: 'USA', iata: 'ANC' },
  'KFAI': { name: 'Fairbanks International Airport', city: 'Fairbanks', country: 'USA', iata: 'FAI' },
  'KHNL': { name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'USA', iata: 'HNL' },
  'KOGG': { name: 'Kahului Airport', city: 'Kahului', country: 'USA', iata: 'OGG' },
  'KLIH': { name: 'Lihue Airport', city: 'Lihue', country: 'USA', iata: 'LIH' },
  'KKOA': { name: 'Kona International Airport', city: 'Kailua-Kona', country: 'USA', iata: 'KOA' },

  // North America - Canada
  'CYYZ': { name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', iata: 'YYZ' },
  'CYVR': { name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', iata: 'YVR' },
  'CYUL': { name: 'Montreal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', iata: 'YUL' },
  'CYYC': { name: 'Calgary International Airport', city: 'Calgary', country: 'Canada', iata: 'YYC' },
  'CYEG': { name: 'Edmonton International Airport', city: 'Edmonton', country: 'Canada', iata: 'YEG' },
  'CYOW': { name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', country: 'Canada', iata: 'YOW' },
  'CYHZ': { name: 'Halifax Stanfield International Airport', city: 'Halifax', country: 'Canada', iata: 'YHZ' },
  'CYWG': { name: 'Winnipeg James Armstrong Richardson International Airport', city: 'Winnipeg', country: 'Canada', iata: 'YWG' },

  // Europe
  'EGLL': { name: 'London Heathrow Airport', city: 'London', country: 'UK', iata: 'LHR' },
  'EGKK': { name: 'London Gatwick Airport', city: 'London', country: 'UK', iata: 'LGW' },
  'EGLC': { name: 'London City Airport', city: 'London', country: 'UK', iata: 'LCY' },
  'EGGW': { name: 'London Luton Airport', city: 'London', country: 'UK', iata: 'LTN' },
  'EGSS': { name: 'London Stansted Airport', city: 'London', country: 'UK', iata: 'STN' },
  'LFPG': { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', iata: 'CDG' },
  'LFPO': { name: 'Orly Airport', city: 'Paris', country: 'France', iata: 'ORY' },
  'EDDF': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', iata: 'FRA' },
  'EDDM': { name: 'Munich Airport', city: 'Munich', country: 'Germany', iata: 'MUC' },
  'EHAM': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', iata: 'AMS' },
  'LEMD': { name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', iata: 'MAD' },
  'LEBL': { name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', iata: 'BCN' },
  'LIRF': { name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', iata: 'FCO' },
  'LIMC': { name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', iata: 'MXP' },
  'LSGG': { name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', iata: 'GVA' },
  'LSZH': { name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', iata: 'ZUR' },
  'LOWW': { name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', iata: 'VIE' },
  'EPWA': { name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', iata: 'WAW' },
  'LKPR': { name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', iata: 'PRG' },
  'LHBP': { name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary', iata: 'BUD' },
  'ESSA': { name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', iata: 'ARN' },
  'ENGM': { name: 'Oslo Airport', city: 'Oslo', country: 'Norway', iata: 'OSL' },
  'EKCH': { name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', iata: 'CPH' },
  'EFHK': { name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland', iata: 'HEL' },
  'EBBR': { name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', iata: 'BRU' },
  'ELLX': { name: 'Luxembourg Airport', city: 'Luxembourg', country: 'Luxembourg', iata: 'LUX' },
  'LPPT': { name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', iata: 'LIS' },
  'LPPR': { name: 'Francisco Sá Carneiro Airport', city: 'Porto', country: 'Portugal', iata: 'OPO' },
  'LGAV': { name: 'Athens International Airport', city: 'Athens', country: 'Greece', iata: 'ATH' },
  'LTBA': { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', iata: 'IST' },
  'UUDD': { name: 'Domodedovo International Airport', city: 'Moscow', country: 'Russia', iata: 'DME' },
  'UUEE': { name: 'Sheremetyevo International Airport', city: 'Moscow', country: 'Russia', iata: 'SVO' },

  // Asia
  'RJTT': { name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', iata: 'HND' },
  'RJAA': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', iata: 'NRT' },
  'RKSI': { name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', iata: 'ICN' },
  'VHHH': { name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', iata: 'HKG' },
  'WSSS': { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', iata: 'SIN' },
  'ZBAA': { name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', iata: 'PEK' },
  'ZSPD': { name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', iata: 'PVG' },
  'ZGGG': { name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', iata: 'CAN' },
  'VABB': { name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', iata: 'BOM' },
  'VIDP': { name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', iata: 'DEL' },
  'VECC': { name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India', iata: 'CCU' },
  'VOMM': { name: 'Chennai International Airport', city: 'Chennai', country: 'India', iata: 'MAA' },
  'VOBL': { name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', iata: 'BLR' },
  'VOTV': { name: 'Trivandrum International Airport', city: 'Thiruvananthapuram', country: 'India', iata: 'TRV' },
  'VOCB': { name: 'Cochin International Airport', city: 'Kochi', country: 'India', iata: 'COK' },
  'VOBG': { name: 'Mysore Airport', city: 'Mysore', country: 'India', iata: 'MYQ' },
  'VABB': { name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', iata: 'BOM' },
  'VTBS': { name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', iata: 'BKK' },
  'WIII': { name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', iata: 'CGK' },
  'RPLL': { name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', iata: 'MNL' },
  'WMKK': { name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', iata: 'KUL' },
  'RCTP': { name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', iata: 'TPE' },

  // Middle East
  'OMDB': { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', iata: 'DXB' },
  'OMAA': { name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', iata: 'AUH' },
  'OOMS': { name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', iata: 'MCT' },
  'OEDF': { name: 'King Fahd International Airport', city: 'Dammam', country: 'Saudi Arabia', iata: 'DMM' },
  'OERK': { name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', iata: 'RUH' },
  'OOMS': { name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', iata: 'MCT' },
  'OTHH': { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', iata: 'DOH' },
  'LLBG': { name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', iata: 'TLV' },

  // Africa
  'FAOR': { name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', iata: 'JNB' },
  'FACT': { name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', iata: 'CPT' },
  'HECA': { name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', iata: 'CAI' },
  'DNMM': { name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', iata: 'LOS' },
  'HKJK': { name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', iata: 'NBO' },
  'HLLB': { name: 'Benina International Airport', city: 'Benghazi', country: 'Libya', iata: 'BEN' },
  'DTTA': { name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia', iata: 'TUN' },
  'DAAG': { name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria', iata: 'ALG' },
  'GMMN': { name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', iata: 'CMN' },

  // Oceania
  'YSSY': { name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', iata: 'SYD' },
  'YMML': { name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', iata: 'MEL' },
  'YBBN': { name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', iata: 'BNE' },
  'YPPH': { name: 'Perth Airport', city: 'Perth', country: 'Australia', iata: 'PER' },
  'YSCB': { name: 'Canberra Airport', city: 'Canberra', country: 'Australia', iata: 'CBR' },
  'YBCG': { name: 'Gold Coast Airport', city: 'Gold Coast', country: 'Australia', iata: 'OOL' },
  'NZAA': { name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', iata: 'AKL' },
  'NZWN': { name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand', iata: 'WLG' },
  'NZCH': { name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', iata: 'CHC' },

  // South America
  'SBGR': { name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', iata: 'GRU' },
  'SBGL': { name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', iata: 'GIG' },
  'SAEZ': { name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', iata: 'EZE' },
  'SCEL': { name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', iata: 'SCL' },
  'SKBO': { name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', iata: 'BOG' },
  'SPJC': { name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', iata: 'LIM' },
  'SULS': { name: 'Carrasco International Airport', city: 'Montevideo', country: 'Uruguay', iata: 'MVD' },
  'SVMI': { name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela', iata: 'CCS' }
};

class AirportLookupService {
  constructor() {
    this.airportDatabase = AIRPORT_DATABASE;
    this.buildSearchIndex();
  }

  /**
   * Build search index for fast lookups
   */
  buildSearchIndex() {
    this.searchIndex = {
      byIcao: {},
      byIata: {},
      byName: {},
      byCity: {},
      byCountry: {}
    };

    // Build indexes
    Object.entries(this.airportDatabase).forEach(([icao, data]) => {
      // ICAO index
      this.searchIndex.byIcao[icao] = { icao, ...data };
      
      // IATA index
      if (data.iata) {
        this.searchIndex.byIata[data.iata] = { icao, ...data };
      }
      
      // Name index (multiple variations)
      const nameVariations = this.generateNameVariations(data.name);
      nameVariations.forEach(variation => {
        this.searchIndex.byName[variation] = { icao, ...data };
      });
      
      // City index
      const cityVariations = this.generateCityVariations(data.city);
      cityVariations.forEach(variation => {
        this.searchIndex.byCity[variation] = { icao, ...data };
      });
      
      // Country index
      this.searchIndex.byCountry[data.country.toLowerCase()] = { icao, ...data };
    });
  }

  /**
   * Generate name variations for better matching
   */
  generateNameVariations(name) {
    const variations = [name.toLowerCase()];
    
    // Remove common words
    const commonWords = ['international', 'airport', 'field', 'terminal', 'regional'];
    let cleanName = name.toLowerCase();
    commonWords.forEach(word => {
      cleanName = cleanName.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
    });
    variations.push(cleanName);
    
    // Add abbreviated versions
    const words = cleanName.split(/\s+/);
    if (words.length > 1) {
      variations.push(words.join(' '));
      variations.push(words.map(w => w.charAt(0)).join(''));
    }
    
    return [...new Set(variations)].filter(v => v.length > 0);
  }

  /**
   * Generate city variations for better matching
   */
  generateCityVariations(city) {
    const variations = [city.toLowerCase()];
    
    // Handle common city name variations
    const cityMappings = {
      'new york': ['nyc', 'ny', 'manhattan', 'brooklyn'],
      'los angeles': ['la', 'lax'],
      'san francisco': ['sf', 'san fran'],
      'washington': ['dc', 'washington dc'],
      'miami': ['mia'],
      'chicago': ['chi'],
      'boston': ['bos'],
      'atlanta': ['atl'],
      'dallas': ['dfw'],
      'houston': ['hou'],
      'phoenix': ['phx'],
      'las vegas': ['vegas'],
      'seattle': ['sea'],
      'denver': ['den'],
      'minneapolis': ['minn', 'msp'],
      'detroit': ['det'],
      'philadelphia': ['philly'],
      'baltimore': ['bwi'],
      'tampa': ['tpa'],
      'orlando': ['mco'],
      'portland': ['pdx'],
      'salt lake city': ['slc'],
      'new orleans': ['nola'],
      'cincinnati': ['cincy'],
      'indianapolis': ['indy'],
      'columbus': ['cmh'],
      'pittsburgh': ['pitt'],
      'cleveland': ['cle'],
      'nashville': ['nash'],
      'memphis': ['mem'],
      'jacksonville': ['jax'],
      'raleigh': ['rdu'],
      'fort myers': ['fmy'],
      'sacramento': ['sac'],
      'san jose': ['sjc'],
      'oakland': ['oak'],
      'ontario': ['ont'],
      'burbank': ['bur'],
      'santa ana': ['sna'],
      'albuquerque': ['abq'],
      'tucson': ['tus'],
      'el paso': ['elp'],
      'oklahoma city': ['okc'],
      'tulsa': ['tul'],
      'omaha': ['oma'],
      'des moines': ['dsm'],
      'kansas city': ['kc'],
      'milwaukee': ['mke'],
      'grand rapids': ['grr'],
      'buffalo': ['buf'],
      'rochester': ['roc'],
      'syracuse': ['syr'],
      'albany': ['alb'],
      'hartford': ['hfd'],
      'providence': ['pvd'],
      'bangor': ['bgr'],
      'anchorage': ['anc'],
      'fairbanks': ['fai'],
      'honolulu': ['hnl'],
      'kahului': ['ogg'],
      'lihue': ['lih'],
      'kailua-kona': ['kona']
    };
    
    const cityLower = city.toLowerCase();
    if (cityMappings[cityLower]) {
      variations.push(...cityMappings[cityLower]);
    }
    
    return [...new Set(variations)];
  }

  /**
   * Search for airports by query
   */
  searchAirports(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = new Set();
    const scoredResults = [];

    // Search by ICAO code (exact match gets highest priority)
    if (this.searchIndex.byIcao[normalizedQuery.toUpperCase()]) {
      const airport = this.searchIndex.byIcao[normalizedQuery.toUpperCase()];
      scoredResults.push({ ...airport, score: 100, matchType: 'icao' });
      results.add(airport.icao);
    }

    // Search by IATA code
    if (this.searchIndex.byIata[normalizedQuery.toUpperCase()]) {
      const airport = this.searchIndex.byIata[normalizedQuery.toUpperCase()];
      if (!results.has(airport.icao)) {
        scoredResults.push({ ...airport, score: 95, matchType: 'iata' });
        results.add(airport.icao);
      }
    }

    // Search by name
    Object.entries(this.searchIndex.byName).forEach(([key, airport]) => {
      if (key.includes(normalizedQuery) && !results.has(airport.icao)) {
        const score = this.calculateNameScore(key, normalizedQuery);
        if (score > 50) {
          scoredResults.push({ ...airport, score, matchType: 'name' });
          results.add(airport.icao);
        }
      }
    });

    // Search by city
    Object.entries(this.searchIndex.byCity).forEach(([key, airport]) => {
      if (key.includes(normalizedQuery) && !results.has(airport.icao)) {
        const score = this.calculateCityScore(key, normalizedQuery);
        if (score > 50) {
          scoredResults.push({ ...airport, score, matchType: 'city' });
          results.add(airport.icao);
        }
      }
    });

    // Sort by score and return top results
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => ({
        icao: result.icao,
        iata: result.iata,
        name: result.name,
        city: result.city,
        country: result.country,
        matchType: result.matchType,
        score: result.score
      }));
  }

  /**
   * Calculate name match score
   */
  calculateNameScore(name, query) {
    if (name === query) return 100;
    if (name.startsWith(query)) return 90;
    if (name.includes(query)) return 70;
    return 50;
  }

  /**
   * Calculate city match score
   */
  calculateCityScore(city, query) {
    if (city === query) return 85;
    if (city.startsWith(query)) return 75;
    if (city.includes(query)) return 60;
    return 50;
  }

  /**
   * Get airport by ICAO code
   */
  getAirportByIcao(icao) {
    return this.searchIndex.byIcao[icao.toUpperCase()] || null;
  }

  /**
   * Get airport by IATA code
   */
  getAirportByIata(iata) {
    return this.searchIndex.byIata[iata.toUpperCase()] || null;
  }

  /**
   * Validate ICAO code format
   */
  isValidIcao(icao) {
    return /^[A-Z]{4}$/.test(icao);
  }

  /**
   * Validate IATA code format
   */
  isValidIata(iata) {
    return /^[A-Z]{3}$/.test(iata);
  }

  /**
   * Get all airports for a country
   */
  getAirportsByCountry(country) {
    return Object.values(this.airportDatabase)
      .filter(airport => airport.country.toLowerCase() === country.toLowerCase())
      .map(airport => ({
        icao: Object.keys(this.airportDatabase).find(icao => 
          this.airportDatabase[icao] === airport
        ),
        ...airport
      }));
  }

  /**
   * Get airport statistics
   */
  getStats() {
    const countries = new Set(Object.values(this.airportDatabase).map(a => a.country));
    return {
      totalAirports: Object.keys(this.airportDatabase).length,
      totalCountries: countries.size,
      countries: Array.from(countries).sort()
    };
  }
}

module.exports = AirportLookupService;
