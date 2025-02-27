# Add the API info for all NSF/NASA affiliations
UPDATE affiliations SET apiTarget = '/awards/nsf'
  WHERE ror_id IN ('https://ror.org/0171mag52', 'https://ror.org/027k65916', 'https://ror.org/027ka1x80',
    'https://ror.org/0540g1c48', 'https://ror.org/02acart68', 'https://ror.org/059fqnc42',
    'https://ror.org/01cyfxe35', 'https://ror.org/04xx4z452', 'https://ror.org/0399mhs52',
    'https://ror.org/02epydz83', 'https://ror.org/03j9e2j92', 'https://ror.org/02s42x260',
    'https://ror.org/01p7gwa14', 'https://ror.org/021nxhr62', 'https://ror.org/01qxmdg18',
    'https://ror.org/04aqat463', 'https://ror.org/006ndaj41', 'https://ror.org/03em45j53',
    'https://ror.org/045t78n53', 'https://ror.org/00r57r863', 'https://ror.org/01rcfpa16',
    'https://ror.org/014eweh95', 'https://ror.org/001xhss06', 'https://ror.org/04qn9mx93',
    'https://ror.org/03g87he71', 'https://ror.org/01tnvpc68', 'https://ror.org/01rvays47',
    'https://ror.org/002jdaq33', 'https://ror.org/025kzpk63', 'https://ror.org/04nh1dc89',
    'https://ror.org/01mng8331', 'https://ror.org/02rdzmk74', 'https://ror.org/053a2cp42',
    'https://ror.org/014bj5w56', 'https://ror.org/00whkrf32', 'https://ror.org/05s7cqk18',
    'https://ror.org/02kd4km72', 'https://ror.org/03mamvh39', 'https://ror.org/00b6sbb32',
    'https://ror.org/0471zv972', 'https://ror.org/028yd4c30', 'https://ror.org/01krpsy48',
    'https://ror.org/050rnw378', 'https://ror.org/0388pet74', 'https://ror.org/03xyg3m20',
    'https://ror.org/05p847d66', 'https://ror.org/037gd6g64', 'https://ror.org/05v01mk25',
    'https://ror.org/05wqqhv83', 'https://ror.org/05nwjp114', 'https://ror.org/05fnzca26',
    'https://ror.org/02trddg58', 'https://ror.org/029b7h395', 'https://ror.org/04mg8wm74',
    'https://ror.org/01ar8dr59', 'https://ror.org/01pc7k308', 'https://ror.org/051fftw81',
    'https://ror.org/04ap5x931', 'https://ror.org/00apvva27', 'https://ror.org/04nseet23',
    'https://ror.org/04k9mqs78', 'https://ror.org/01k638r21', 'https://ror.org/01gmp5538',
    'https://ror.org/01vnjbg30', 'https://ror.org/03h7mcc28', 'https://ror.org/05wgkzg12',
    'https://ror.org/0445wmv88', 'https://ror.org/02dz2hb46', 'https://ror.org/034m1ez10',
    'https://ror.org/02a65dj82', 'https://ror.org/020fhsn68', 'https://ror.org/03z9hh605',
    'https://ror.org/04ya3kq71', 'https://ror.org/04evh7y43', 'https://ror.org/04h67aa53',
    'https://ror.org/025dabr11', 'https://ror.org/04vw0kz07', 'https://ror.org/054ydxh33',
    'https://ror.org/01sharn77', 'https://ror.org/0401vze59', 'https://ror.org/04hccab49',
    'https://ror.org/02ch5q898', 'https://ror.org/04437j066', 'https://ror.org/028b18z22',
    'https://ror.org/00ryjtt64', 'https://ror.org/01dy3j343', 'https://ror.org/02yhmtm27',
    'https://ror.org/05q5zzn71', 'https://ror.org/02ajbht29', 'https://ror.org/057xcp713',
    'https://ror.org/04xr3m042', 'https://ror.org/05b5wvf11', 'https://ror.org/01bp8jn44',
    'https://ror.org/01wmcm405', 'https://ror.org/03cbpc337', 'https://ror.org/02z0mvz29',
    'https://ror.org/01ghfgz70', 'https://ror.org/02shwmm76');

# Add the API info for all NIH affiliations
UPDATE affiliations SET apiTarget = '/awards/nih'
  WHERE ror_id IN ('https://ror.org/01cwqze88', 'https://ror.org/04mhx6838', 'https://ror.org/012pb6c26',
    'https://ror.org/03wkg3b53', 'https://ror.org/0060t0j89', 'https://ror.org/00372qc85',
    'https://ror.org/00190t495', 'https://ror.org/00j4k1h63', 'https://ror.org/01y3zfr79',
    'https://ror.org/04q48ey07', 'https://ror.org/0493hgw16', 'https://ror.org/04vfsmv21',
    'https://ror.org/03jh5a977', 'https://ror.org/04xeg9z08', 'https://ror.org/01s5ya894',
    'https://ror.org/02meqm098', 'https://ror.org/049v75w11', 'https://ror.org/004a2wv92',
    'https://ror.org/00adh9b73', 'https://ror.org/043z4tv69', 'https://ror.org/00x19de83',
    'https://ror.org/02jzrsm59', 'https://ror.org/006zn3t30', 'https://ror.org/04byxyr05',
    'https://ror.org/04pw6fb54', 'https://ror.org/05aq6yn88', 'https://ror.org/02xey9a22',
    'https://ror.org/00fj8a872', 'https://ror.org/01wtjyf13', 'https://ror.org/04r5s4b52',
    'https://ror.org/046zezr58', 'https://ror.org/02e3wq066', 'https://ror.org/031gy6182',
    'https://ror.org/054j5yq82', 'https://ror.org/02yrzyf97', 'https://ror.org/012wp4251',
    'https://ror.org/01jdyfj45', 'https://ror.org/04g4sf283');

# Add the API info for all affiliations who appear in the Crossref grants API
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/501100011730' WHERE ror_id = 'https://ror.org/00x0z1472';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/501100002241' WHERE ror_id = 'https://ror.org/00097mb19';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/501100001821' WHERE ror_id = 'https://ror.org/01f9mc681';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/501100000223' WHERE ror_id = 'https://ror.org/000hkd473';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100010586' WHERE ror_id = 'https://ror.org/04a2qqf85';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100008984' WHERE ror_id = 'https://ror.org/0252rqe04';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100008539' WHERE ror_id = 'https://ror.org/00qfsn733';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100006309' WHERE ror_id = 'https://ror.org/04sedwh45';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100005536' WHERE ror_id = 'https://ror.org/02r8tn769';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100005202' WHERE ror_id = 'https://ror.org/01frxsf98';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100005190' WHERE ror_id = 'https://ror.org/025ck6r46';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100001771' WHERE ror_id = 'https://ror.org/02gegq725';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100001545' WHERE ror_id = 'https://ror.org/01hx92781';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000980' WHERE ror_id = 'https://ror.org/04zk9fe75';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000971' WHERE ror_id = 'https://ror.org/00mwp5989';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000968' WHERE ror_id = 'https://ror.org/013kjyp64';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000936' WHERE ror_id = 'https://ror.org/006wxqw41';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000913' WHERE ror_id = 'https://ror.org/03dy4aq19';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000893' WHERE ror_id = 'https://ror.org/01cmst727';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000048' WHERE ror_id = 'https://ror.org/02e463172';
UPDATE affiliations SET apiTarget = '/awards/crossref/10.13039/100000015' WHERE ror_id = 'https://ror.org/01bj3aw27';
