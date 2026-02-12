--
-- PostgreSQL database dump
--

\restrict GS4JUgBFt5KlxUkIVh5aP60PxApGapZsSKBp36Jv7algSr5k7wS6BfIdl5NJF5a

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    user_id text,
    label text,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    region text,
    postal_code text,
    country text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    icon text,
    image_url text,
    parent_id text,
    slug text,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id text,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    order_id text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id text,
    product_id integer,
    name text NOT NULL,
    price numeric NOT NULL,
    quantity integer NOT NULL,
    image_url text,
    delivery_charge numeric DEFAULT 0,
    selected_variations jsonb DEFAULT '{}'::jsonb,
    item_delivery_charge numeric(10,2) DEFAULT 200.00
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number text NOT NULL,
    user_id text,
    date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'Processing'::text,
    items_count integer DEFAULT 0,
    subtotal numeric DEFAULT 0,
    shipping numeric DEFAULT 0,
    total numeric DEFAULT 0,
    payment_method text,
    shipping_name text,
    shipping_email text,
    shipping_phone text,
    shipping_address text,
    shipping_city text,
    shipping_postal_code text,
    shipping_notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    original_price numeric,
    image_url text,
    category_id text,
    subcategory text,
    rating numeric DEFAULT 0,
    reviews integer DEFAULT 0,
    badge text,
    description text,
    stock integer DEFAULT 0,
    delivery_charge numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    variations jsonb DEFAULT '[]'::jsonb,
    additional_images text[] DEFAULT '{}'::text[],
    category_ids text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer,
    rating integer,
    comment text,
    reviewer_name character varying(100),
    reviewer_email character varying(100),
    review_date timestamp without time zone DEFAULT now(),
    picture_urls text[],
    verified_purchase boolean DEFAULT true,
    status character varying(20) DEFAULT 'approved'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name text NOT NULL,
    location text,
    image_url text,
    rating integer,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_id_seq OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'user'::text,
    first_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    user_id text NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, label, line1, line2, city, region, postal_code, country, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, icon, image_url, parent_id, slug, description) FROM stdin;
corner-decor	Corner Decor		https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop	\N	corner-decor	\N
artificial-plants	Artificial Plants		https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop	\N	artificial-plants	\N
indoor-artificial	Indoor Artificial Plants	\N	\N	artificial-plants	indoor-artificial-plants	\N
outdoor-artificial	Outdoor Artificial Plants	\N	\N	artificial-plants	outdoor-artificial-plants	\N
floor-artificial	Floor Artificial Plants	\N	\N	artificial-plants	floor-artificial-plants	\N
table-artificial	Table Artificial Plants	\N	\N	artificial-plants	table-artificial-plants	\N
artificial-under-5k	Under 5,000	\N	\N	artificial-plants	under-5-000	\N
artificial-under-10k	Under 10,000	\N	\N	artificial-plants	under-10-000	\N
indoor-floral	Indoor Floral Plants	\N	\N	floral-plants	indoor-floral-plants	\N
outdoor-floral	Outdoor Floral Plants	\N	\N	floral-plants	outdoor-floral-plants	\N
floor-floral	Floor Floral Plants	\N	\N	floral-plants	floor-floral-plants	\N
table-floral	Table Floral Plants	\N	\N	floral-plants	table-floral-plants	\N
floral-under-5k	Under 5,000	\N	\N	floral-plants	under-5-000-floral-under-5k	\N
floral-under-10k	Under 10,000	\N	\N	floral-plants	under-10-000-floral-under-10k	\N
vases	Vases	\N	\N	table-decor	vases	\N
mini-plants	Mini Plants	\N	\N	table-decor	mini-plants	\N
ceramic-centerpieces	Ceramic Centerpieces	\N	\N	table-decor	ceramic-centerpieces	\N
metal-centerpieces	Metal Centerpieces	\N	\N	table-decor	metal-centerpieces	\N
long-floor-plants	Long / Floor Plants	\N	\N	corner-decor	long-floor-plants	\N
table-lamps-corner	Table Lamps	\N	\N	corner-decor	table-lamps	\N
floor-lamps-corner	Floor Lamps	\N	\N	corner-decor	floor-lamps	\N
statement-decor	Statement Décor Pieces	\N	\N	corner-decor	statement-d-cor-pieces	\N
hanging-decor	Hanging Decor	\N	\N	wall-decor	hanging-decor	\N
hanging-plants	Hanging Plants	\N	\N	wall-decor	hanging-plants	\N
wall-mirrors	Wall Mirrors	\N	\N	wall-decor	wall-mirrors	\N
floor-mirrors	Floor Mirrors	\N	\N	wall-decor	floor-mirrors	\N
standing-mirrors	Standing Mirrors	\N	\N	wall-decor	standing-mirrors	\N
leaning-mirrors	Leaning Mirrors	\N	\N	wall-decor	leaning-mirrors	\N
table-lamps	Table Lamps	\N	\N	lighting-lamps	table-lamps-table-lamps	\N
floor-lamps	Floor Lamps	\N	\N	lighting-lamps	floor-lamps-floor-lamps	\N
decorative-lamps	Decorative Lamps	\N	\N	lighting-lamps	decorative-lamps	\N
ramadan-table-decor	Ramadan Table Decor	\N	\N	ramadan-decor	ramadan-table-decor	\N
lanterns	Lanterns	\N	\N	ramadan-decor	lanterns	\N
crescent-islamic	Crescent & Islamic Decor	\N	\N	ramadan-decor	crescent-islamic-decor	\N
iftar-table-styling	Iftar Table Styling	\N	\N	ramadan-decor	iftar-table-styling	\N
floral-plants	Floral Plants		https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop	\N	floral-plants	\N
table-decor	Table Decor		https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop	\N	table-decor	\N
lighting-lamps	Lighting & Lamps		https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop	\N	lighting-lamps	\N
ramadan-decor	Ramadan Decor		https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&h=300&fit=crop	\N	ramadan-decor	\N
wall-decor	Wall Decor		https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=300&fit=crop	\N	wall-decor	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, name, email, subject, message, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, order_id, is_read, created_at) FROM stdin;
12	1770139903727	Order Placed!	Your order #ORD-20260006 has been received and is being processed.	success	1770139962185	f	2026-02-03 22:32:42.186639+05
14	1770153038482	Order Placed!	Your order #ORD-20260007 has been received and is being processed.	success	1770153971683	f	2026-02-04 02:26:11.684872+05
13	\N	New Order Received	Order #ORD-20260007 placed for Rs. 9,700	success	1770153971683	t	2026-02-04 02:26:11.684872+05
11	\N	New Order Received	Order #ORD-20260006 placed for Rs. 5,300	success	1770139962185	t	2026-02-03 22:32:42.186639+05
9	\N	New Order Received	Order #ORD-20260005 placed for Rs. 2,650	success	1770137327772	t	2026-02-03 21:48:47.772626+05
2	1	Order Placed!	Your order #ORD-20260001 has been received and is being processed.	success	1769962865616	t	2026-02-01 21:21:05.617283+05
1	\N	New Order Received	Order #ORD-20260001 placed for Rs. 2,650	success	1769962865616	t	2026-02-01 21:21:05.617283+05
3	\N	New Order Received	Order #ORD-20260002 placed for Rs. 26,000	success	1769963037999	t	2026-02-01 21:23:57.999803+05
6	1769962921777	Order Placed!	Your order #ORD-20260003 has been received and is being processed.	success	1770127130582	t	2026-02-03 18:58:50.58425+05
5	\N	New Order Received	Order #ORD-20260003 placed for Rs. 2,650	success	1770127130582	t	2026-02-03 18:58:50.58425+05
7	\N	New Order Received	Order #ORD-20260004 placed for Rs. 104,000	success	1770127990982	t	2026-02-03 19:13:10.984175+05
8	1769962921777	Order Placed!	Your order #ORD-20260004 has been received and is being processed.	success	1770127990982	t	2026-02-03 19:13:10.984175+05
10	1770137100344	Order Placed!	Your order #ORD-20260005 has been received and is being processed.	success	1770137327772	t	2026-02-03 21:48:47.772626+05
4	1769962921777	Order Placed!	Your order #ORD-20260002 has been received and is being processed.	success	1769963037999	t	2026-02-01 21:23:57.999803+05
15	\N	New Order Received	Order #ORD-20260008 placed for Rs. 5,400	success	1770213923782	f	2026-02-04 19:05:23.780191+05
16	1769962921777	Order Placed!	Your order #ORD-20260008 has been received and is being processed.	success	1770213923782	f	2026-02-04 19:05:23.780191+05
17	\N	New Order Received	Order #ORD-20260009 placed for Rs. 4,200	success	1770226081139	f	2026-02-04 22:28:01.139706+05
18	1770137100344	Order Placed!	Your order #ORD-20260009 has been received and is being processed.	success	1770226081139	f	2026-02-04 22:28:01.139706+05
19	\N	New Order Received	Order #ORD-20260010 placed for Rs. 2,700	success	1770321752024	f	2026-02-06 01:02:32.024697+05
20	1769962921777	Order Placed!	Your order #ORD-20260010 has been received and is being processed.	success	1770321752024	f	2026-02-06 01:02:32.024697+05
21	\N	New Order Received	Order #ORD-20260011 placed for Rs. 9,600	success	1770322040937	f	2026-02-06 01:07:20.937783+05
22	1769962921777	Order Placed!	Your order #ORD-20260011 has been received and is being processed.	success	1770322040937	f	2026-02-06 01:07:20.937783+05
23	\N	New Order Received	Order #ORD-20260012 placed for Rs. 2,700	success	1770322163583	f	2026-02-06 01:09:23.584216+05
24	1769962921777	Order Placed!	Your order #ORD-20260012 has been received and is being processed.	success	1770322163583	f	2026-02-06 01:09:23.584216+05
25	\N	New Order Received	Order #ORD-20260013 placed for Rs. 2,700	success	1770322214775	f	2026-02-06 01:10:14.775927+05
26	1769962921777	Order Placed!	Your order #ORD-20260013 has been received and is being processed.	success	1770322214775	f	2026-02-06 01:10:14.775927+05
27	\N	New Order Received	Order #ORD-20260014 placed for Rs. 4,000	success	1770322265384	f	2026-02-06 01:11:05.385275+05
28	1769962921777	Order Placed!	Your order #ORD-20260014 has been received and is being processed.	success	1770322265384	f	2026-02-06 01:11:05.385275+05
29	\N	New Order Received	Order #ORD-20260015 placed for Rs. 8,000	success	1770325916826	f	2026-02-06 02:11:56.827331+05
30	1770137100344	Order Placed!	Your order #ORD-20260015 has been received and is being processed.	success	1770325916826	f	2026-02-06 02:11:56.827331+05
31	\N	New Order Received	Order #ORD-20260016 placed for Rs. 3,100	success	1770453683009	f	2026-02-07 13:41:23.010241+05
32	1770137100344	Order Placed!	Your order #ORD-20260016 has been received and is being processed.	success	1770453683009	f	2026-02-07 13:41:23.010241+05
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, name, price, quantity, image_url, delivery_charge, selected_variations, item_delivery_charge) FROM stdin;
1	1769962865616	\N	Velvet Cushion Set	2500	1	https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800	150	{}	200.00
3	1770127130582	\N	Velvet Cushion Set	2500	1	https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800	150	{}	200.00
5	1770137327772	\N	Velvet Cushion Set	2500	1	https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800	150	{}	200.00
6	1770139962185	\N	Velvet Cushion Set	2500	2	https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800	150	{}	200.00
2	1769963037999	\N	Luxury Chandelier	25000	1	https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&q=80&w=800	1000	{}	200.00
4	1770127990982	\N	Luxury Chandelier	25000	4	https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&q=80&w=800	1000	{}	200.00
7	1770153971683	11	Golden Bicycle Planter Stand with Artificial Flowers	5200	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPTImageJan21_2026_05_27_16PM.png?v=1768998467	500	{}	200.00
8	1770153971683	13	White Orchid Artificial Plant in Modern Diamond planter	3500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0_4.png?v=1769254568	500	{}	200.00
9	1770213923782	17	17-Leaf Money Plant	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	200	{}	200.00
10	1770213923782	17	17-Leaf Money Plant	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	200	{"Color": "black"}	200.00
11	1770226081139	22	Artificial Aloe Vera Plant	4000	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image27.jpg	200	{}	200.00
12	1770321752024	17	17 Leaf Money Plant with planter	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	200	{"Planter Color": "black"}	200.00
13	1770322040937	22	Artificial Aloe Vera Plant	4000	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image27.jpg	200	{}	200.00
14	1770322040937	34	Matte Donut Vase 8 Inch	1500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image20.jpg	200	{"Vase Color": "gray", "Filling color": "pink"}	200.00
15	1770322040937	33	12 Inch Donut Vase	3500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image25.jpg	200	{}	200.00
16	1770322163583	17	17 Leaf Money Plant with planter	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	200	{"Planter Color": "black"}	200.00
17	1770322214775	17	17 Leaf Money Plant with planter	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	200	{"Planter Color": "black"}	200.00
18	1770322265384	13	White Orchid Artificial Plant in Diamond planter	3500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0_4.png?v=1769254568	500	{"Color": "white", "Height": "3.5 ft"}	200.00
19	1770325916826	48	Tall Black & Gold Floor Vase with Artificial Green Arrangement	3800	2	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_07_16_PM.png	200	{}	200.00
20	1770453683009	42	18 -Leaf banana palm Planter Set	2500	1	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/2F6AD5B3-3495-49EC-94FF-31FAC8A5A577.jpg	600	{"Planter color": "Black"}	200.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, date, status, items_count, subtotal, shipping, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_postal_code, shipping_notes, created_at) FROM stdin;
1769962865616	ORD-20260001	1	2026-02-01 21:21:05.616+05	Processing	1	2500	150	2650	jazzcash	Admin User	admin@cosmodecor.pk	03144000055	idk any thing	Sukkur			2026-02-01 21:21:05.617283+05
1769963037999	ORD-20260002	1769962921777	2026-02-01 21:23:57.999+05	Processing	1	25000	1000	26000	jazzcash	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Islamabad			2026-02-01 21:23:57.999803+05
1770127130582	ORD-20260003	1769962921777	2026-02-03 18:58:50.582+05	Processing	1	2500	150	2650	jazzcash	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Bahawalpur			2026-02-03 18:58:50.58425+05
1770127990982	ORD-20260004	1769962921777	2026-02-03 19:13:10.982+05	Processing	4	100000	4000	104000	nayapay	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	wfca	Sukkur			2026-02-03 19:13:10.984175+05
1770137327772	ORD-20260005	1770137100344	2026-02-03 21:48:47.772+05	Processing	1	2500	150	2650	easypaisa	Malalaika Ajmal	malaikaajmal61@gmail.com	03325932181	C/46-satellite town	Rawalpindi	46510		2026-02-03 21:48:47.772626+05
1770139962185	ORD-20260006	1770139903727	2026-02-03 22:32:42.185+05	Processing	2	5000	300	5300	nayapay	Muhammad Hassan	Haccan96@gmail.com	03102440000	River gardens 	Islamabad			2026-02-03 22:32:42.186639+05
1770153971683	ORD-20260007	1770153038482	2026-02-04 02:26:11.683+05	Processing	2	8700	1000	9700	easypaisa	hoor bhutto	bhuttohoorunnisa@gmail.com	03323601969	yo mama street	Other	yo mama	smd	2026-02-04 02:26:11.684872+05
1770213923782	ORD-20260008	1769962921777	2026-02-04 19:05:23.782+05	Processing	2	5000	400	5400	nayapay	Hucen Mehdi	hussainmehdi311@gmail.com	03350500333	river garden housing society street 8 house 2	Islamabad	44000		2026-02-04 19:05:23.780191+05
1770226081139	ORD-20260009	1770137100344	2026-02-04 22:28:01.139+05	Processing	1	4000	200	4200	nayapay	Malalaika Poty	malaikaajmal61@gmail.com	03365400746	Heiajaka33	Rawalpindi	Uewiwjw	Discount please	2026-02-04 22:28:01.139706+05
1770321752024	ORD-20260010	1769962921777	2026-02-06 01:02:32.024+05	Confirmed	1	2500	200	2700	cod	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Islamabad			2026-02-06 01:02:32.024697+05
1770322040937	ORD-20260011	1769962921777	2026-02-06 01:07:20.937+05	Confirmed	3	9000	600	9600	cod	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Sargodha			2026-02-06 01:07:20.937783+05
1770322163583	ORD-20260012	1769962921777	2026-02-06 01:09:23.583+05	Confirmed	1	2500	200	2700	cod	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Hyderabad			2026-02-06 01:09:23.584216+05
1770322214775	ORD-20260013	1769962921777	2026-02-06 01:10:14.775+05	Confirmed	1	2500	200	2700	cod	Hucen Mehdi	hussainmehdi311@gmail.com	03144000055	idk any thing	Bahawalpur			2026-02-06 01:10:14.775927+05
1770322265384	ORD-20260014	1769962921777	2026-02-06 01:11:05.384+05	Confirmed	1	3500	500	4000	cod	Hucen Hussain	hussainmehdi311@gmail.com	03350500333	river garden housing society street 8 house 2	Islamabad	44000		2026-02-06 01:11:05.385275+05
1770325916826	ORD-20260015	1770137100344	2026-02-06 02:11:56.826+05	Processing	2	7600	400	8000	easypaisa	Malaika Ajmal	ishaajmal430@gmail.com	03365290505	C/46-satellite town, C/46-satellite town	Rawalpindi	46510		2026-02-06 02:11:56.827331+05
1770453683009	ORD-20260016	1770137100344	2026-02-07 13:41:23.009+05	Processing	1	2500	600	3100	easypaisa	Malalaika Ajmal	malaikaajmal61@gmail.com	0336 5290505	C/46-satellite town	Rawalpindi	46510		2026-02-07 13:41:23.010241+05
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, price, original_price, image_url, category_id, subcategory, rating, reviews, badge, description, stock, delivery_charge, created_at, variations, additional_images, category_ids) FROM stdin;
34	Matte Donut Vase 8 Inch	1500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image20.jpg	table-decor	Decor	5	1		✨ Features:\n\n8 inch elegant donut design  stylish & eye-catching\n\nMatte ceramic finish  gives a premium, modern look\n\nComes with premium artificial floral stems\n\nBreak resistant & durable build\n\nPerfect for centerpieces, shelves, and entryways	19	200	2026-02-04 00:22:58.316465+05	[{"name": "Vase Color", "options": ["gray"], "required": true, "priceAdjustments": {"gray": 0}}, {"name": "Filling color", "options": ["pink", "Yellow", "Orange"], "required": true, "priceAdjustments": {"pink": 0, "Orange": 0, "Yellow": 0}}]	{https://ibb.co/4RvB3hdz,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324579/image21_fj1shf.jpg,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324581/image22_htkkxu.jpg}	{table-decor}
33	12 Inch Donut Vase	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image25.jpg	table-decor	Decor	4.5	44		⭐ Features:\n\nLarge 12 inch size  perfect for centerpieces\nChalk matte finish premium, soft & modern look\nComes with premium artificial filler stems\nDurable & break-resistant material\nIdeal for consoles, coffee tables, shelves & office décor\nMinimalist donut shape adds aesthetic charm\nPerfect gifting option for home decor lovers	17	200	2026-02-04 00:22:58.315418+05	[{"name": "Vase Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}, {"name": "Filling Color", "options": ["Black", "Skin"], "required": true, "priceAdjustments": {"Skin": 0, "Black": 0}}]	{[url=https://imgbb.com/][img]https://i.ibb.co/39WT7J5K/image24.jpg[/img][/url]}	{table-decor}
18	5 ft Tall Money Plant	7000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image2_9.jpg	artificial-plants	Decor	4.6	14			19	200	2026-02-04 00:22:12.816196+05	[{"name": "Color", "options": ["black", "White"], "required": true, "priceAdjustments": {"White": 0, "black": 0}}]	{}	{artificial-plants}
20	Tall Artificial Furry Plant	8500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image8_3.jpg	floral-plants	Decor	4.1	37			50	500	2026-02-04 00:22:12.821943+05	[]	{}	{floral-plants}
13	White Orchid Artificial Plant in Diamond planter	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0_4.png?v=1769254568	artificial-plants	Decor	4.5	1		Key Features:\n\n✔ Realistic white orchid flowers\n✔ Premium artificial foliage\n✔ Modern geometric planter\n✔ Maintenance free décor\n✔ Long lasting & durable	58	500	2026-02-03 23:26:43.76369+05	[{"name": "planter Color", "options": ["white", "black"], "required": true, "priceAdjustments": {"black": 0}}, {"name": "Height", "options": ["3.5 ft"], "required": true, "priceAdjustments": {}}]	{}	{artificial-plants}
31	12 Inch Long LED Twist Candles	350	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image19_1.jpg	table-decor	Decor	4.1	12			119	200	2026-02-04 00:22:58.310054+05	[{"name": "Quantity", "options": ["1", "3", "9"], "required": true, "priceAdjustments": {"1": 0, "3": 600, "9": 2200}}]	{}	{table-decor}
37	Dracaena Plant in Matte Diamond Chalk Planter	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_04_46_21_PM.png	artificial-plants	Decor	4.2	31		✨ Features:\n\n3.5 ft tall premium artificial plant\nUnique purple PVC rubber leaves for a luxury look\nBlack diamond cut planter in chalk material\nStable, heavy base  perfect for indoor use\nZero maintenance; long lasting colors	40	400	2026-02-04 00:37:58.282825+05	[{"name": "Size", "options": ["3.5 ft height"], "required": true, "priceAdjustments": {"3.5 ft height": 0}}, {"name": "Planter Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324814/ChatGPT_Image_Jan_24_2026_04_49_44_PM_p0vy0z.png,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770327186/image36_1_zuf00p.jpg}	{artificial-plants}
46	Royal Blue Chalk Pot with Artificial Flower Arrangement	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image5_5.jpg	floral-plants	Decor	4.4	10		Key Features:\nMaterial: High-quality ceramic pot with a smooth chalk finish\n\nColor: Elegant royal blue with golden detailing\n\nArrangement: Includes lifelike flowers and soft decorative stems\n\nMaintenance-Free: No care required stays fresh all year round\n\n	9	500	2026-02-04 00:37:58.295247+05	[{"name": "Color", "options": ["blue"], "required": true, "priceAdjustments": {"blue": 0}}, {"name": "Stand", "options": ["With stand", "Without stand"], "required": false, "priceAdjustments": {"With stand": 1000, "Without stand": 0}}]	{}	{floral-plants}
47	 Artificial Banana Plant in Wooden  Planter	10000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_21_42_PM.png	artificial-plants	Decor	4	17		Height: 5.5 feet perfect for floor display and statement corners\n\nMaterial: Premium PVC leaves with a solid wooden planter\n\nDesign: Pinterest-inspired modern decor piece for any room\n\nMaintenance-Free: No watering or sunlight required\n\n	10	500	2026-02-04 00:37:58.297028+05	[{"name": "Height", "options": [], "required": false, "priceAdjustments": {}}]	{}	{artificial-plants}
48	Tall Black & Gold Floor Vase with Artificial Green Arrangement	3800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_07_16_PM.png	artificial-plants	Decor	5	1		Features:\n\nPremium tall vase with black matte texture and gold rim\n\nIncludes artificial green leaves (maintenance-free)\n\nIdeal for corners, hallways, or living rooms\n\nAdds a luxury accent to modern interiors\n\n📏 Approx Height: 4.5 ft	26	400	2026-02-04 00:37:58.298039+05	[{"name": "Height", "options": [], "required": false, "priceAdjustments": {}}]	{}	{artificial-plants}
52	Green Shade Touch Sensor Table Lamp | 3 Light Modes Modern Gold Bedside Lamp	2500	3000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image4_6.jpg	lighting-lamps	Decor	4.6	27		Key Features:\n Premium metallic gold base with smooth finish Pleated lampshade for soft, diffused lighting Ideal for bedroom, study, or side table decor Compact and lightweight for easy placement Plug-in power with on/off button for convenience	9	200	2026-02-04 00:37:58.373844+05	[]	{}	{lighting-lamps}
51	Artificial Blossom Tree 4.75 ft | Cherry Blossom Floor Plant for Home & Event Decor	6500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image3_3.jpg	artificial-plants	Decor	4.2	22	\N	Key Features: Height: 4.75 ft (approx.) Available in 3 elegant colors â€“ yellow, purple, and pink Realistic blossoms with soft, full petals Comes with a durable decorative pot Ideal for living rooms, weddings, and photo corners Maintenance-free and reusable for years	28	200	2026-02-04 00:37:58.372691+05	[{"name": "Color", "options": ["pink"], "required": true, "priceAdjustments": {"pink": 0}}]	{}	{artificial-plants}
39	5.5 FT Artificial Banana Palm Plant  With White Pot	6500	8000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_22_2026_04_04_34_PM.png	artificial-plants	Decor	4.6	43		Product Features :\n\nInstantly adds height and lush greenery to your home or office space\n\nDesigned in a durable, non breakable planter with a premium look\n\nFeatures elegant golden artificial leaves that elevate interior decor\n\nMade with high quality PVC rubber leaves for a realistic finish\n\nIncludes 8 adjustable leaves, allowing you to style the plant your way\n\nSupported by 8 sturdy metal rod stems in varied heights for a natural appearance\n\nTotal height of 5.5 ft, perfect as a floor standing indoor plant\n\nCompletely maintenance-free artificial plant no watering or sunlight needed	23	600	2026-02-04 00:37:58.285336+05	[{"name": "Planter color", "options": ["White", "Black"], "required": true, "priceAdjustments": {"Black": 0, "White": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324840/ChatGPT_Image_Jan_22_2026_04_08_57_PM_wwrgav.png}	{artificial-plants}
66	 Single Geometric Hanging Ceiling Lamp 	3000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-12at9.08.57PM_1.jpg	lighting-lamps	Decor	4.6	42		 Key Features:\n Single triangle geometric pendant light Industrial-style matte black metal frame Minimalist design with modern appeal Adjustable hanging cord for customizable height Compatible with E27 bulbs (LED, Edison, or warm light)	5	350	2026-02-04 00:37:58.387711+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
42	18 -Leaf banana palm Planter Set	2500	3500	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/2F6AD5B3-3495-49EC-94FF-31FAC8A5A577.jpg	artificial-plants	Decor	4.846153846153846	13		 1 Premium Planter available in Black or White\n\n 1 Artificial Plant with 17 Leaves  realistic, lush, and maintenance-free\n\n1 Packet of Decorative Stones for that perfect finishing touch\n\n \n\nPerfect for bedrooms, living rooms, offices, or cozy corners  this set instantly elevates any space with its modern, minimal vibe \n\n \n\nAvailable Options:\n\n \n\nPlanter Colors: Black / White\nLeaf Shades: Red / Yellow	52	600	2026-02-04 00:37:58.289901+05	[{"name": "Planter color", "options": ["Black", "White"], "required": true, "priceAdjustments": {"Black": 0, "White": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770401882/IMG-7351_ge3uja.webp,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770399790/WhatsApp_Image_2025-12-10_at_6.17.04_PM_empmrn.jpg}	{artificial-plants}
72	72 Leave  Swiss Cheese Plant with Coconut Husk 	8200	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsApp_Image_2025-09-12_at_5.18.02_PM_1.jpg	artificial-plants	Decor	4.5	29		 Height: 5.5 ft   Perfect for corner placement\n✔ Realistic Design Broad Monstera style Swiss Cheese leaves\n✔ Eco Touch Base  Coconut husk for a natural look\n✔ Durable & Long Lasting No watering, no sunlight required\n✔ Stylish Pot Included Sleek black pot with golden rim for a modern vibe	20	700	2026-02-04 00:37:58.394676+05	[]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770481542/WhatsApp_Image_2025-09-12_at_5.18.02_PM_akjkbc.jpg}	{artificial-plants}
73	Grass Plant with Woven Basket & Wooden Stand	5500	\N	https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770481889/WhatsApp_Image_2025-09-12_at_5.18.01_PM_bfp2ag.jpg	artificial-plants	Decor	4.1	25		Key Features :\n\nPremium handwoven cane basket\nDetachable solid wooden legs for flexible styling\nMinimal pampas grass arrangement included\nDecorative stone base for stability & elegance\nLightweight yet sturdy construction	5	700	2026-02-04 00:37:58.395712+05	[{"name": "Size", "options": ["Small", "Large"], "required": false, "priceAdjustments": {"Large": 1000, "Small": 0}}]	{}	{artificial-plants}
74	Dracaena Marginata Tricolor Plant with White & Golden Rimmed Planter	13500	\N	https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770484992/WhatsApp_Image_2025-09-11_at_3.58.25_PM_1_d6yned.jpg	artificial-plants	Decor	4.8	13		Key Features \n\nHeight: Approx. 6 ft\n6 adjustable stems in different heights\nRealistic multi-shaded foliage\nPremium non-breakable GRP planter\nElegant metal rim detailing\nLow-maintenance	15	800	2026-02-04 00:37:58.396667+05	[]	{}	{artificial-plants}
35	3.5 Ft Dracaena Plant with Shiny Ceramic Vase	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image31.jpg	artificial-plants	Decor	4.6	10		Product Features :\n\nHeight: 3.5 ft artificial Dracaena plant, ideal as a floor plant\n\nFoliage: Two tone Dracaena leaves in natural yellow and green shades\n\nVase Material: Premium ceramic chalk vase\n\nVase Design: Golden foil effect on a blue-greyish two-tone finish for a luxury look\n\nPlacement: Suitable for home, office, living room, corners, lobbies, and entryways\n\nMaintenance: Low-maintenance artificial plant	50	400	2026-02-04 00:37:58.278354+05	[{"name": "Height", "options": ["3,5 ft"], "required": true, "priceAdjustments": {"3,5 ft": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770326331/image29_ph3tx2.jpg,httpsdbhcpgyvh://res.cloudinary.com//image/upload/v1770326331/image29_ph3tx2.jpg}	{artificial-plants}
49	Chalk Bowl with Flower Arrangement with Metal Stand	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_22_2026_04_26_45_PM.png	floral-plants	Decor	5	3		white chalk bowl with golden strokes is paired with a beautifully crafted artificial flower arrangement that adds instant height and charm to any space. The bowl itself stands 1 ft tall, while the floral arrangement extends the total height to approximately 2.5 ft, creating a well-balanced and visually striking display.\n\nThe arrangement is thoughtfully styled with premium artificial flowers and fillers to give a full, graceful look from every angle. It is placed on a sturdy wired metal stand with a height of 3 ft, making it an ideal floor standing décor piece for living rooms, entryways, lounges, and office interiors.\n\nWith its soft white base, delicate golden detailing, and elegant floral composition, this piece blends effortlessly with modern, contemporary, and luxury interior styles. Being completely maintenance free, it offers lasting beauty without the need for watering or sunlight.	36	800	2026-02-04 00:37:58.298915+05	[{"name": "STAND", "options": ["with stand", "Without stand"], "required": true, "priceAdjustments": {"with stand": 1000, "Without stand": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324839/ChatGPT_Image_Jan_22_2026_04_14_41_PM_hgbbvf.png,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324838/ChatGPT_Image_Jan_22_2026_04_29_40_PM_q0mhjs.png}	{floral-plants}
22	Artificial Aloe Vera Plant	4000	6000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image27.jpg	artificial-plants	Decor	4.8	42			18	200	2026-02-04 00:22:12.824402+05	[{"name": "Height", "options": ["4 ft"], "required": false, "priceAdjustments": {"4 ft": 0}}]	{}	{artificial-plants}
88	3.5 ft Artificial Plant in Irregular Diamond Pot â€“ Modern Home Decor Planter	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_04_49_44_PM.png	artificial-plants	Decor	4.5	19	\N	Features Height: 3.5 ft (including plant ) Pot: Irregular diamond design Plant: High-quality artificial plant (realistic look) Perfect for: Home, office, gifting, events	59	200	2026-02-04 00:37:58.413527+05	[{"name": "Color", "options": ["clear"], "required": true, "priceAdjustments": {"clear": 0}}]	{}	{artificial-plants}
25	10 Piece Tulip Bunch	1200	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image10.jpg	floral-plants	Decor	4.7	23			0	200	2026-02-04 00:22:12.827868+05	[{"name": "Quantity", "options": ["5"], "required": true, "priceAdjustments": {"5": 0}}]	{}	{floral-plants}
26	Black Shiny Ceramic Vase	3800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image32.jpg	floral-plants	Decor	4	32			20	200	2026-02-04 00:22:12.953128+05	[{"name": "Size", "options": ["3 ft"], "required": true, "priceAdjustments": {"3 ft": 0}}, {"name": "", "options": [], "required": false, "priceAdjustments": {}}]	{}	{floral-plants}
102	Luxury Black Roses with Golden Accents in Ceramic Vase	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4.jpg	artificial-plants	Decor	4.4	28	\N	Product Features: Premium ceramic vase with elegant golden finish Beautiful artificial black roses paired with golden floral accents Long-lasting, maintenance-free dÃ©cor piece Perfect centerpiece for living rooms, offices, weddings, and events Adds a touch of modern luxury and sophistication to any space Great for gifting on special occasions	26	200	2026-02-04 00:37:58.427201+05	[{"name": "Color", "options": ["floral"], "required": true, "priceAdjustments": {"floral": 0}}]	{}	{artificial-plants}
109	5.5ft Artificial Areca Palm Plant with White & Gold Woven Planter Indoor PVC Rubber Decorative Plant	11500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_0_2.jpg	artificial-plants	Decor	4.8	18	\N	Product Details: Plant Name: Areca Palm (Artificial) Plant Type/Class: Tall Indoor Decorative Palm Plant Material (Plant): Premium PVC Rubber Leaves &amp; Stems Planter Material: White Woven Finish with Gold Rim (Durable, Premium Look) Height: 5.5 feet (including pot) Base: Decorative Pebbles for a natural touch âœ¨ Key Features: Tall (5.5ft) elegant design â€“ perfect for corners and entryways Realistic &amp; premium PVC rubber leaves â€“ washable &amp; long-lasting Stylish white woven planter with golden rim for a luxury touch Perfect for living rooms, bedrooms, offices, hotels, restaurants &amp; events Zero maintenance â€“ no watering, sunlight, or trimming required	29	500	2026-02-04 00:37:58.435008+05	[{"name": "Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{artificial-plants}
112	Artificial Calathea Plant in Marble Ceramic Planter 3 ft Decorative Indoor Plant for Home & Office DÃ©cor	4000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_0_1.jpg	artificial-plants	Decor	4.7	12	\N	Product Details Plant Name: Calathea (Artificial) Height: 3 ft (approx.) Weight: 1.2 kg (approx.) Planter Material: Marble-finish ceramic pot Plant Material: PVC rubber Suitable For: Indoor use (living room, office, commercial spaces)	49	200	2026-02-04 00:37:58.438116+05	[{"name": "size", "options": ["3ft"], "required": true, "priceAdjustments": {"3ft": 0}}]	{}	{artificial-plants}
114	4.5 ft Artificial Money Plant in Black GRP Non-Breakable Planter	4500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_6_1.jpg	artificial-plants	Decor	4.5	7	\N	Add greenery to your interiors with our 4.5 ft Artificial Money Plant , styled in a sleek black GRP non-breakable planter . This modern decorative plant is perfect for enhancing any home, office, or commercial space with a touch of freshness and elegance. âœ”ï¸ 4.5 ft tall â€“ ideal for corner styling &amp; statement dÃ©cor âœ”ï¸ Artificial Money Plant â€“ realistic &amp; maintenance-free âœ”ï¸ Black GRP planter â€“ sturdy, durable &amp; unbreakable âœ”ï¸ Modern minimal design â€“ fits all interior themes âœ”ï¸ Perfect for living rooms, bedrooms, offices &amp; lobbies This money plant is not only a dÃ©cor essential but also a symbol of prosperity and positivity for your space.	89	200	2026-02-04 00:37:58.439916+05	[{"name": "Planter Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{artificial-plants}
115	5.5 ft Artificial Planter with Swiss Cheese Leaves, Coconut Husk Filling, Black Non-Breakable Planter with Golden Rim	8900	10000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4_2.jpg	artificial-plants	Decor	4.5	49	\N	Bring nature indoors with our 5.5 ft Artificial Swiss Cheese Plant , crafted with realistic Swiss Cheese leaves and natural-looking coconut husk filling for a fresh, organic feel. The plant comes in a black, non-breakable planter with an elegant golden rim , making it a perfect statement piece for homes, offices, cafÃ©s, and studios. âœ”ï¸ 5.5 ft tall â€“ eye-catching decorative height âœ”ï¸ Realistic Swiss Cheese leaves with natural coconut husk filling âœ”ï¸ Black planter with golden rim â€“ modern &amp; classy finish âœ”ï¸ Non-breakable planter â€“ durable and long-lasting âœ”ï¸ Perfect for living room, hallway, office decor &amp; interior styling	100	500	2026-02-04 00:37:58.440932+05	[{"name": "Planter Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{artificial-plants}
117	LED crystal lamp	1500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image4_5.jpg	lighting-lamps	Decor	4.7	7		Features: Multi-color changing light (controlled by remote) Elegant crystal-cut design that sparkles beautifully USB rechargeable / plug-in use Perfect for bedrooms, side tables, or dÃ©cor corners\n\n	8	200	2026-02-04 00:40:10.473762+05	[]	{}	{lighting-lamps}
53	Touch Sensor Table Lamp with 3 Light Modes	2500	3000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image1_5.jpg	lighting-lamps	Decor	4.8	23		Key Features: \nTouch sensor control easy on/off and brightness adjustment 3 color light modes: warm, natural, and cool white Elegant gold metallic base with pleated lampshade Ideal for bedside, study, or living room lighting USB powered with stable illumination Compact, lightweight, and durable design	30	200	2026-02-04 00:37:58.374799+05	[{"name": "Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{lighting-lamps}
96	18 Inch Table Lamp with Shade â€“ Modern Bedside & Living Room Lighting	11000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_9_4.jpg	lighting-lamps	Decor	4.5	18	\N	Features: 18-inch table lamp with premium fabric shade Perfect for bedside tables, nightstands, living rooms, and offices Provides soft, warm, and cozy lighting Durable design with a stylish, minimalist look Ideal for modern, classic, or luxury home dÃ©cor	10	500	2026-02-04 00:37:58.421974+05	[{"name": "color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
12	3 Piece Golden Candle Stand Set with Plastic LED Spiral Candles	1800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_21_2026_05_38_35_PM.png?v=1768999136	table-decor	Decor	4.5	4		Product Type:\n\nDecorative Candle Stand Set Set Includes:  3 Candle Stands + Plastic LED Candles Candle Type: Plastic LED candles\n Design: Elegant spiral LED candles for realistic candle look Material\n Stand: Premium quality metal	40	200	2026-02-03 23:26:43.761913+05	[{"name": "candle", "options": ["With led spiral candle", "Without candle"], "required": true, "priceAdjustments": {"Without candle": 1000, "With led spiral candle": null}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324857/ChatGPT_Image_Jan_21_2026_05_34_24_PM_nt7lkm.png}	{table-decor}
17	17 Leaf Money Plant with planter	2500	3500	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPT_Image_Jan_24_2026_05_13_00_PM.png	artificial-plants	Decor	5	3	Hot selling	✨ Product Features:\n\nGRP Non Breakable Planter  Strong, durable, and long lasting.\n\nPVC Rubber Leaves  Realistic texture with a natural green finish\n\nPVC Rubber Stems Flexible, sturdy, and easy to shape\n\nAdjustable Arrangement  Customize the leaf spread as you like\n\nHeight: 3 ft  Perfect for corners, entrances, offices & living rooms\n\nColor Options: Black and White planter	22	600	2026-02-04 00:22:12.674877+05	[{"name": "Planter Color", "options": ["black", "White"], "required": true, "priceAdjustments": {"White": 0, "black": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770324797/ChatGPT_Image_Jan_24_2026_05_14_04_PM_eirsst.png}	{artificial-plants}
14	Moon Candle Holder Table Decor Resin Incense Burner	2500	4850	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_5_9.jpg?v=1770108395	ramadan-decor	Decor	4.5	2		Ramadan Kareem Moon Shape Candle Holder Resin Incense Burner Islamic Tabletop Home Decor Ornament This Ramadan Moon Candle Holder can be used as a candle stand, incense burner, or aromatherapy ornament , creating a calming and welcoming atmosphere in your living room, dining table, or office. It is also a perfect Ramadan gift for family, friends, and loved ones. Whether you are decorating your home for Ramadan Kareem, Eid, or Islamic events , this elegant tabletop decor piece will enhance your interior with a luxurious and meaningful touch.	20	200	2026-02-03 23:26:43.765297+05	[{"name": "Material", "options": ["resin"], "required": true, "priceAdjustments": {}}, {"name": "size", "options": ["8 inch height"], "required": true, "priceAdjustments": {}}]	{}	{ramadan-decor}
23	Realistic Pink Peony Buds	1200	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image14.jpg	floral-plants	Decor	4.1	17			20	200	2026-02-04 00:22:12.825494+05	[{"name": "Color", "options": ["pink"], "required": true, "priceAdjustments": {"pink": 0}}, {"name": "Quantity ", "options": ["5 pc", "10 pc"], "required": false, "priceAdjustments": {"5 pc": 0, "10 pc": 1000}}]	{}	{floral-plants}
11	Golden Bicycle Planter Stand with Artificial Flowers	5000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/ChatGPTImageJan21_2026_05_27_16PM.png?v=1768998467	floral-plants	Decor	4.5	2		Product Features Product Type: Luxury Bicycle Planter Stand Material: Premium quality metal with golden finish Height: 3.5 feet (including flower arrangement) Design: Elegant bicycle/cycle style stand with dual planters Flowers: Comes with beautiful artificial flower arrangements Finish: Smooth, rust-resistant metallic gold coating Usage: Ideal for living room, lounge, balcony, porch, garden &amp; entryway	24	500	2026-02-03 23:26:43.754388+05	[{"name": "Size", "options": ["3 ft", "4ft"], "required": true, "priceAdjustments": {"4ft": 800, "3 ft": 0}}]	{}	{floral-plants}
21	Artificial Lily Flower Arrangement	3000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image19.jpg	table-decor	Decor	4	49			20	200	2026-02-04 00:22:12.823183+05	[{"name": "Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{table-decor}
24	Black 10 Piece Tulip Bunch	2000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image12_1.jpg	floral-plants	Decor	4.4	8			0	200	2026-02-04 00:22:12.826639+05	[{"name": "Quantity", "options": ["5 flowers"], "required": true, "priceAdjustments": {"5 flowers": 0}}]	{}	{floral-plants}
27	Black & Gold Minaret Style Bakhoor / Incense Burner	2500	4800	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_6_6.jpg	ramadan-decor	Decor	4.1	32		Enhance your home with the rich aroma of bakhoor...	20	200	2026-02-04 00:22:58.29752+05	[]	{}	{ramadan-decor}
19	Pink Chalk Bowl with Floral Arrangement	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0_9.jpg	floral-plants	Decor	4.5	30		⭐ Color Details\n\nBowl Color: Shiny Hot Pink\nStand Color: Matte Gold\nFlowers: Soft Pink Pampas + Pink & Green Floral Mix\n\n⭐ Material Details\n\nBowl Material: High-quality chalk ceramic\nStand Material: Heavyduty metal (rust-resistant)\nFlowers: Premium imported artificial flowers & pampas (washable & long-lasting)\n\n\n⭐ Features\n\nTotal Height: 4.75 ft\nHighly durable & stable metal stand\nPremium floral arrangement with soft pink pampas\nLightweight, easy to move\nPerfect for corners, entrances, stair areas & lounges\nZero maintenance artificial flowers\nModern, aesthetic, luxury decor vibe	20	800	2026-02-04 00:22:12.8207+05	[{"name": "Color", "options": ["pink"], "required": true, "priceAdjustments": {"pink": 0}}, {"name": "Stand", "options": ["With stand", "without stand"], "required": false, "priceAdjustments": {"With stand": 1000, "without stand": null}}]	{}	{floral-plants}
32	1 packet extra stones	150	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image4_11.jpg	table-decor	Decor	4.7	15			997	200	2026-02-04 00:22:58.311421+05	[{"name": "Color", "options": ["white", "Black"], "required": true, "priceAdjustments": {"Black": 0, "white": 0}}]	{}	{table-decor}
30	Handmade Wooden Folding Room Divider	29000	45000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/D26D65CD-644E-4A6B-921D-C4E5EBAA6DA1.jpg	wall-decor	Decor	4.5	11			1	500	2026-02-04 00:22:58.307999+05	[{"name": "Size", "options": ["5 ft"], "required": true, "priceAdjustments": {"5 ft": 0}}]	{}	{wall-decor}
38	 White Ceramic Donut Vase with Dried Bunny Tail Grass	1800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image8_2.jpg	table-decor	Decor	4.3	39		\nFeatures:\n\nMaterial: Premium quality ceramic\nDesign: Donut shape with a central hollow ring\nColor: Glossy white finish\nDecoration: Includes dried bunny tail grass\n\n	10	200	2026-02-04 00:37:58.284088+05	[{"name": "Filling color", "options": ["skin", "black"], "required": false, "priceAdjustments": {"skin": 0, "black": 0}}, {"name": "Height", "options": [], "required": false, "priceAdjustments": {}}]	{https://res.cloudinary.com/dpz4mq1ql/image/upload/v1770324212/image_2026-02-06_014331714_mheo9f.png,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770396665/image9_1_xva0gy.jpg}	{table-decor}
36	Aurora Bloom Artificial Leaf Plant in Textured Ceramic Vase	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image34.jpg	floral-plants	Decor	4.6	49		✨ Features:\n\n3 ft height perfect statement decor piece\n\nWhite chalk round pot with a smooth matte finish\n\nMixed plant + floral arrangement for a fuller, premium look\n\nStable base & high quality materials\n\nZero maintenance colors won’t fade\n\nIdeal for entryways, lounges, offices, and home interiors\n\nReady to place decor, no assembly required\n\n\n	49	400	2026-02-04 00:37:58.281563+05	[]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770326752/image33_lrcq2m.jpg}	{floral-plants}
40	Artificial Flower Arrangement in Textured Chalk Bowl	5500	6500	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image3_7.jpg	floral-plants	Decor	4.5	32		artificial flower arrangement in a chalk bowl is designed to add soft height and refined beauty to your space. With an approximate overall height of 18–20 inches, it works perfectly as a tabletop centerpiece for consoles, side tables, coffee tables, or reception areas.\n\nThe arrangement features a graceful mix of white pampas-style feathers, ivory and off-white palm leaves, and lush green foliage as the base. Delicate small pink floral accents are added throughout to bring a subtle pop of color and balance the neutral tones beautifully. The filling is thoughtfully layered to give the arrangement a full, airy, and naturally flowing look.\n\nIt is set in a round blush-toned chalk bowl finished with subtle golden vein detailing, which enhances the overall luxury feel without being overpowering. This piece is completely maintenance-free, requiring no watering or sunlight	20	500	2026-02-04 00:37:58.287295+05	[{"name": "stand", "options": ["With Stand", "Without stand"], "required": true, "priceAdjustments": {"With Stand": 1000, "Without stand": 0}}]	{}	{floral-plants}
54	 Succulent Plant with Yellow-Orange Tips	1500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0_1.jpg	table-decor	Decor	4.1	8		Key Features:  \nRealistic Succulent Design: Green leaves with warm yellow-orange accents for a natural, sunlit look.	20	200	2026-02-04 00:37:58.375758+05	[{"name": "Decoration material", "options": ["plastic"], "required": true, "priceAdjustments": {"plastic": 0}}]	{}	{table-decor}
41	 Purple Chalk bowl with Gold Metal Stand	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image5_6.jpg	floral-plants	Decor	4.5	35		Key Features:\nHeight: 4.75 ft (including stand)\n\nPremium-quality decorative planter with gold metal stand\n\nGlossy purple finish with elegant golden detailing\n\nNon-breakable & durable build\n\nAdds a luxury aesthetic to any corner	18	800	2026-02-04 00:37:58.28876+05	[{"name": "Stand", "options": ["Without stand", "with stand"], "required": true, "priceAdjustments": {"with stand": 1000, "Without stand": 0}}]	{}	{floral-plants}
44	Brown Chalk Pot with Orange Pampas Arrangement	4500	\N	https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770402434/image4_8_lpavva.jpg	floral-plants	Decor	4.6	38		this Brown Chalk Pot featuring an Orange Pampas Arrangement. The glossy brown ceramic pot, accented with artistic beige streaks, adds an earthy elegance to any interior. Its vibrant orange pampas and lush greenery infuse natural charm, making it an eye-catching centerpiece for your living room, office, or console table.	0	500	2026-02-04 00:37:58.292261+05	[]	{}	{floral-plants}
56	White Lotus Flower with Decorative Black Pot	7000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image5_3.jpg	artificial-plants	Decor	4.4	7		Key Features: \nRealistic Design: Beautifully crafted white lotus flowers with lifelike green leaves. \nDurable Pot: Comes in a black woven-style decorative pot with a white rim for a modern touch. \nMaintenance-Free: No watering, trimming, or sunlight required. \n Versatile Use: Ideal for home decor, office spaces, hotels, or special events. \nPerfect Gift: A thoughtful housewarming, festive, or corporate gift option.	40	800	2026-02-04 00:37:58.37774+05	[{"name": "Planter color", "options": ["Black"], "required": true, "priceAdjustments": {"Black": 0}}]	{}	{artificial-plants}
55	Succulent Plant in White Ceramic Pot Small Potted Greenery for Home & Office DÃ©cor	1500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image2_2.jpg	table-decor	Decor	4.3	25		Add a refreshing touch of greenery to your space with this artificial succulent plant in a stylish white ceramic pot. Perfect for desks, shelves, or tabletops, it brings a natural vibe without any upkeep	20	200	2026-02-04 00:37:58.376723+05	[]	{}	{table-decor}
58	4.5 ft  Money Plant wit hPlanter	4500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image4_4.jpg	artificial-plants	Decor	4.4	31			19	600	2026-02-04 00:37:58.379644+05	[{"name": "Planter color", "options": ["White", "black"], "required": true, "priceAdjustments": {"White": 0, "black": 0}}]	{}	{artificial-plants}
59	Chalk Flower Pot with Artificial Flowers & Metal Stand 	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image9_5f2755ef-14cc-427e-b810-3e182916a64e.jpg	floral-plants	Decor	4.7	15		Key Features Premium Ceramic Pot  Glossy red round pot adds luxury and durability 4.5 ft Height with Metal Stand  Perfect floor decor piece for any space Vibrant Artificial Flowers Maintenance-free, long lasting  realistic look Sturdy Black Metal BaseModern design that ensures stability and elegance Versatile Decoration	39	800	2026-02-04 00:37:58.380716+05	[{"name": "stand", "options": ["With stand", "Without stand"], "required": true, "priceAdjustments": {"With stand": 1000, "Without stand": 0}}]	{}	{floral-plants}
57	White Ceramic Donut Vase 	1500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image6_1.jpg	table-decor	Decor	4.4	10			14	200	2026-02-04 00:37:58.378644+05	[{"name": "Vase Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{table-decor}
60	white ceramic flower vase with gold detailing and 3D floral	5500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4_7.jpg	table-decor	Decor	4.2	14		Height : 9 inch \nwirdth : 4 inch \nMaterial : Ceramic 	10	200	2026-02-04 00:37:58.38172+05	[{"name": "Color", "options": ["floral"], "required": true, "priceAdjustments": {"floral": 0}}]	{}	{table-decor}
61	White & Gold Ceramic Flower Vase 	7000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_0_8.jpg	table-decor	Decor	4.6	20		Features : Premium CeramicDurable, glossy white finish with gold highlights. 3D Floral Design Handcrafted gold-edged flowers for a luxurious touch. Multi-Purpose Use  Ideal as a flower vase or decorative table piece. Versatile decor Perfect for living room, bedroom, office or hallway. Gift Ready â€“ Great for weddings, housewarming, or festive occasions.	10	200	2026-02-04 00:37:58.382522+05	[{"name": "Color", "options": ["floral"], "required": true, "priceAdjustments": {"floral": 0}}]	{}	{table-decor}
62	 Ceramic Decorative Vase Blue & Gold Abstract Design 	5000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_5_8.jpg	table-decor	Decor	4.1	36			10	200	2026-02-04 00:37:58.383377+05	[{"name": "Dimensions", "options": ["12 inch"], "required": true, "priceAdjustments": {"12 inch": 0}}]	{}	{table-decor}
80	Black & Gold Ceramic Table Lamps with Golden Fabric Shade â€“ Set of 2, Luxury Decorative Lighting (18 Inch)	10000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.23PM.jpg	lighting-lamps	Decor	4.2	34	\N	Features: Set of 2 luxury black &amp; gold table lamps Premium ceramic body with glossy golden detailing Golden fabric lampshade for cozy, ambient lighting Height: 18 inches â€“ perfect for bedside &amp; side tables Elegant dÃ©cor accent for bedrooms, living rooms &amp; offices Ideal gift option for home dÃ©cor lovers Transform your space with these luxury decorative table lamps that combine elegance, functionality, and timeless style.	6	500	2026-02-04 00:37:58.404007+05	[{"name": "Size", "options": ["18 inch height"], "required": true, "priceAdjustments": {"18 inch height": 0}}]	{}	{lighting-lamps}
78	Face Shaped Ceramic Vase 	999	2500	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.24PM_1.jpg	table-decor	Decor	4.7	28		Features:\n\nArtistic face-shaped ceramic vase design\n\nIncludes artificial plant for a natural touch\n\nPerfect for home décor, office desks, or gifting\n\nModern decorative piece for living rooms & bedrooms\n\n	0	200	2026-02-04 00:37:58.401404+05	[]	{}	{table-decor}
63	Gold & Black vase	6000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2_10.jpg	table-decor	Decor	4.8	19			20	200	2026-02-04 00:37:58.38425+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{table-decor}
64	 White & Gold Porcelain Decorative Flower Pot 	6000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_0_9.jpg	table-decor	Decor	4.7	46			10	200	2026-02-04 00:37:58.385117+05	[{"name": "size", "options": ["12 inch height"], "required": true, "priceAdjustments": {"12 inch height": 0}}]	{}	{table-decor}
65	Nordic Round Ceramic Vase  	6000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_1_7.jpg	table-decor	Decor	4.4	20		Features: Premium quality ceramic/porcelain vase Elegant white finish with gold detailing Modern round design for a luxury look 	10	200	2026-02-04 00:37:58.386245+05	[{"name": "Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{table-decor}
75	Wavy Standing Mirror 5x2 Ft Full Length	15000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_5_7.jpg	wall-decor	Decor	4.6	30		Features: Unique wavy frame design for a modern aesthetic Size: 5x2 ft ideal as a full-length floor mirror Can be used for dressing, decor as a statement piece Perfect for bedrooms, living rooms, hallways\n Durable, stylish, and easy to place or move Transform your interiors with this wavy mirror , blending practicality with bold, contemporary design	15	2500	2026-02-04 00:37:58.39793+05	[{"name": "size", "options": ["5 ft by 2 ft"], "required": true, "priceAdjustments": {"5 ft by 2 ft": 0}}]	{}	{wall-decor}
76	Capsule Shaped Wall Mirror	9000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsApp_Image_2025-09-11_at_3.58.17_PM_1.jpg	wall-decor	Decor	4.6	9		Unique capsule shaped design for a modern look\n\nHigh quality glass with clear reflection\n\nPerfect for bedrooms, living rooms, hallways & dressing rooms\n\nDecorative and functional  adds light & depth to any space\n\nEasy to mount on walls, ideal for home or office décor\n\nBring a touch of sophistication to your interiors with this stylish capsule mirror, blending simplicity with elegance.	200	500	2026-02-04 00:37:58.399112+05	[{"name": "size", "options": ["5 ft by 1.5 ft", "6 by 1.5 ft"], "required": true, "priceAdjustments": {"6 by 1.5 ft": 2000, "5 ft by 1.5 ft": 0}}, {"name": "Frame Color", "options": ["gold", "Black", "White"], "required": true, "priceAdjustments": {"gold": 0, "Black": 0, "White": 0}}, {"name": "Frame Material", "options": ["Iron"], "required": true, "priceAdjustments": {"Iron": 0}}]	{https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770487423/WhatsApp_Image_2025-09-11_at_3.58.18_PM_1_hujmzz.jpg,https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770487422/WhatsApp_Image_2025-09-11_at_3.58.19_PM_ymmqnq.jpg}	{wall-decor}
77	 Banana Plant with 8 Leaves in Non Breakable GRP Pot 	13000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.25PM.jpg	artificial-plants	Decor	4.2	32			20	700	2026-02-04 00:37:58.400215+05	[{"name": "Planter color", "options": ["Black", "White"], "required": true, "priceAdjustments": {"Black": 0, "White": 0}}]	{}	{artificial-plants}
50	Touch Sensor LED Table Lamp	1800	2200	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image8_1.jpg	lighting-lamps	Decor	5	1		Key Features:\n Touch sensor control for easy on/off\n a brightness adjustment 3 lighting modes: warm, neutral, and cool white\n Modern metallic body with premium finish Rechargeable and wireless for flexible use Long-lasting LED light with soft illumination Ideal for bedrooms, living rooms, or dining tables	20	200	2026-02-04 00:37:58.370705+05	[{"name": "Quantity", "options": ["1 pc", "pair"], "required": false, "priceAdjustments": {"1 pc": 0, "pair": 1500}}]	{}	{lighting-lamps}
116	Full Length Arch Mirror with Iron Frame & Stand | Dome Design	9000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4_3.jpg	wall-mirrors	Decor	5.0000000000000000	3	\N	Buy Full Length Arch Mirror with iron frame &amp; detachable stand. Modern dome shaped mirror perfect for bedroom, living room &amp; home decor in Pakistan Upgrade your space with ourÂ Full Length Arch Mirror , designed with a durable iron frame and a detachable iron stand for versatile styling. Its modern dome-shaped arch design makes it a perfect choice for bedrooms, living rooms, hallways, and dressing areas. âœ”ï¸ Premium quality iron frame â€“ sturdy &amp; long-lasting âœ”ï¸ Detachable stand â€“ use as a floor mirror or wall-mounted mirror âœ”ï¸ Elegant arch/dome design â€“ adds a modern aesthetic âœ”ï¸ Perfect for home dÃ©cor, makeup, dressing, or studio styling This mirror isnâ€™t just functional, itâ€™s a statement dÃ©cor piece that enhances any interior instantly.	594	500	2026-02-04 00:37:58.441962+05	[{"name": "size", "options": ["5 FT by 1.5 FT"], "required": true, "priceAdjustments": {"5 FT by 1.5 FT": 0}}]	{}	{wall-mirrors}
89	Set of 2 Islamic Modern Decorative Plates with Stand â€“ Elegant Showpiece for Home Display	4500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image4.jpg	wall-decor	Decor	4.4	18	\N	ðŸ”¹ Features Set of 2 decorative plates with stands Modern Islamic design with elegant detailing Perfect for home display â€“ consoles, shelves, dining spaces Material: Premium ceramic/resin finish (update as per actual) Ideal as a gift or centerpiece	5	200	2026-02-04 00:37:58.414638+05	[{"name": "Color", "options": ["gold"], "required": true, "priceAdjustments": {"gold": 0}}]	{}	{wall-decor}
84	Crystal Table Lamps with Fabric Shades â€“ Set of 2, 18 Inch Height, Elegant Bedside & Living Room Lighting	10500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.20PM.jpg	lighting-lamps	Decor	4.4	39	\N	Features: Set of 2 stylish crystal body table lamps Height: 18 inches (perfect for side tables &amp; nightstands) Premium fabric lampshades for soft, cozy lighting Elegant design suitable for modern and classic interiors Ideal for bedrooms, living rooms, offices, or as a gift Upgrade your space with these decorative crystal lamps that blend luxury with functionality.	6	500	2026-02-04 00:37:58.408595+05	[{"name": "size", "options": ["18 inch height"], "required": true, "priceAdjustments": {"18 inch height": 0}}]	{}	{lighting-lamps}
87	Vintage Handmade Mahogany Wooden Harley Davidson Motorcycle â€“ Collectible Decorative Bike Model	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image3.jpg	table-decor	Decor	4.6	19	\N	ðŸ”¹ Features Material: Premium mahogany wood Design: Handmade with intricate details Style: Vintage Harley Davidson model bike Use: Collectible, desk decor, gifting, display piece	9	200	2026-02-04 00:37:58.412357+05	[{"name": "material", "options": ["Wood"], "required": true, "priceAdjustments": {"Wood": 0}}]	{}	{table-decor}
91	8 Inch Black Resin Lion Statue with Golden Crown â€“ Royal Home Decor & Collectible Figurine	2500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image2_1.jpg	statement-decor	Decor	4.5	7	\N	Bring majesty and strength into your space with this 15-inch black resin lion statue topped with a golden crown . A perfect centerpiece for your home, office desk, or as a unique gift for men. Ideal for collectors and luxury home decor enthusiasts. Cosmo Decorpk Home & Garden > Decor > Artwork > Sculptures & Statues TRUE Color black product.metafields.shopify.color-pattern 0 shopify 9 deny manual 3800 TRUE TRUE https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image0.jpg?v=1757529134 1	0	200	2026-02-04 00:37:58.416554+05	[]	{}	{statement-decor}
85	Round Wall Mirror with Iron Frame â€“ Modern Decorative Mirror for Living Room, Bedroom & Hallway	6500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_1_5.jpg	wall-mirrors	Decor	4.2	34	\N	Shape: Round Frame Material: Strong iron frame Style: Modern, minimalist, durable Perfect For: Living room, bedroom, hallway, entryway, dressing area Enhances light, depth, and wall aesthetics	148	200	2026-02-04 00:37:58.409917+05	[{"name": "size", "options": ["2 by 2 ft"], "required": true, "priceAdjustments": {"2 by 2 ft": 0}}]	{}	{wall-mirrors}
93	Rectangular Full Length Mirror with Iron Frame | Black & White | Wall Mount + Stand	10500	12000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2_8.jpg	wall-mirrors	Decor	4.6	41	\N	Key Features Frame Material: Durable iron frame Color Options: Black / White 5 x 2 ft 6 x 2 ft Â Design: Sleek rectangular shape Placement Options: Can be used with stand or wall mounted Style: Minimal &amp; modern look â€“ fits any dÃ©cor theme Best For: Â Bedrooms &amp; Dressing Areas Â Boutiques &amp; Salons Â Home DÃ©cor &amp; Interior Styling	55	500	2026-02-04 00:37:58.418656+05	[{"name": "Color", "options": ["gold"], "required": true, "priceAdjustments": {"gold": 0}}, {"name": "size", "options": ["5 by 2"], "required": true, "priceAdjustments": {"5 by 2": 0}}]	{}	{wall-mirrors}
86	Blob Mirror â€“ 4 x 2 ft Irregular Shaped Wall Mirror for Modern Home Decor	9500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4_6.jpg	wall-mirrors	Decor	5.0000000000000000	1	\N	Elevate your interiors with this 4x2 ft blob mirror , featuring an irregular organic shape that adds a modern and artistic touch to any wall. Perfect for bedrooms, living rooms, entryways, or studio spaces, this mirror is both functional and stylish. ðŸ”¹ Features Size: 4 x 2 ft Shape: Irregular â€œblobâ€ design Style: Modern, aesthetic wall decor Use: Living room, bedroom, hallway, studio	100	500	2026-02-04 00:37:58.411149+05	[{"name": "frame", "options": ["iron frame"], "required": true, "priceAdjustments": {"iron frame": 0}}]	{}	{wall-mirrors}
103	Artificial Rose and Lily Flower Arrangement in Black Ceramic Vase â€“ Decorative Floral Centerpiece for Home & Office DÃ©cor	2800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2.jpg	artificial-plants	Decor	4.2	28	\N	Product Details Flower Types: Roses &amp; Lilies (Artificial) Height: 2.5 ft (approx.) Weight: 1.5 kg (approx.) Planter Material: Black ceramic vase Flower Material: PVC silk Suitable For: Indoor dÃ©cor &amp; tabletops This artificial floral arrangement is a perfect dÃ©cor piece to bring sophistication and a pop of color into your surroundings.	27	200	2026-02-04 00:37:58.42816+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{artificial-plants}
104	Artificial Lotus Lily Flower Plant 2.5 ft in Ceramic Pot  Decorative Indoor Flower Arrangement for Home & Office	3800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_8_3_93dd650f-8055-4900-ad2b-c2b8fbbe9858.jpg	artificial-plants	Decor	4.6	11	\N	Product Details Plant Name: Lotus Lily (Artificial) Height: 2.5 ft (approx.) Weight: 1.2 kg (approx.) Planter Material: Ceramic pot Plant Material: PVC rubber Suitable For: Indoor dÃ©cor and tabletops This artificial lotus lily is a timeless decorative piece that brings freshness, color, and elegance to your space.	60	200	2026-02-04 00:37:58.428957+05	[{"name": "color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{artificial-plants}
94	LED Blob Mirror 6x2.5 ft | Modern Wall Mirror with Built-in LED Light	15000	25000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output.jpg	wall-mirrors	Decor	4.6	5	\N	Key Features Â Â Size: 6 x 2.5 ft Shape: Modern blob / organic design Lighting: Built-in energy-efficient LED light Functionality: Perfect for both dÃ©cor &amp; dressing use Installation: Wall mount design, easy to install Style: Minimal, chic &amp; modern â€“ a trendsetter for interiors Â Â Â Â Best For: Â Bedrooms &amp; Dressing Corners Â Salons &amp; Boutiques Â Living Room DÃ©cor Â Modern Apartments	100	500	2026-02-04 00:37:58.419802+05	[{"name": "size", "options": ["6ft by 2.5 ft"], "required": true, "priceAdjustments": {"6ft by 2.5 ft": 0}}]	{}	{wall-mirrors}
105	Artificial Dieffenbachia Plant 5 ft in GRP Planter Tall Indoor Decorative Plant for Home & Office Decoror	5000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_0_bb891c0a-6da3-43fc-8d22-e0ac7ad5ca4c.jpg	artificial-plants	Decor	5.0000000000000000	1	\N	Product Details Plant Name: Dieffenbachia (Artificial) Height: 5 ft (approx.) Weight: 1.8 kg (approx.) Planter Material: GRP (Glass Reinforced Plastic) Plant Material: PVC rubber Suitable For: Indoor dÃ©cor (homes, offices, commercial spaces)	0	200	2026-02-04 00:37:58.430246+05	[{"name": "Planter Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{artificial-plants}
95	Abstract Human Figurine Sculptures | Modern Art Resin Decor for Home & Office	3300	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2_4.jpg	statement-decor	Decor	5.0000000000000000	1	\N	Features: Modern abstract human figurine design Premium resin material with smooth finish Available in gold &amp; white colors Perfect for living room, office desk, bookshelves, or side tables Great as a unique art dÃ©cor gift	15	200	2026-02-04 00:37:58.421127+05	[{"name": "Color", "options": ["gold"], "required": true, "priceAdjustments": {"gold": 0}}]	{}	{statement-decor}
110	5 ft Artificial Monstera Deliciosa Plant with Black & Gold Ceramic Planter  Tall Indoor Decorative Plant	11000	15000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_8.jpg	artificial-plants	Decor	4.8	33	\N	Product Details: Plant Name: Monstera Deliciosa (Artificial) Common Name: Swiss Cheese Plant Plant Type/Class: Tall Indoor Decorative Artificial Plant Material: Premium PVC Rubber Leaves &amp; Stems Planter: Elegant Black GRP non breakable planter with Gold Rim Height: 6 feet (including pot) âœ¨ Key Features: Extra-tall (6ft) design â€“ perfect for corners &amp; statement dÃ©cor Realistic &amp; natural-looking PVC rubber foliage Durable &amp; washable â€“ fade-resistant greenery Stylish black &amp; gold GRP planter for a luxury touch Ideal for living rooms, offices, hotels, lobbies, restaurants &amp; event decoration Zero maintenance â€“ no watering, trimming, or sunlight required	30	500	2026-02-04 00:37:58.436383+05	[{"name": "Color", "options": ["white"], "required": true, "priceAdjustments": {"white": 0}}]	{}	{artificial-plants}
111	Artificial Areca Palm Plant with White Ceramic Pot  PVC Rubber Indoor/Outdoor Decor Plant	4500	6000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2_1.jpg	artificial-plants	Decor	4.5	48	\N	Product Details: Plant Type: Artificial Areca Palm Plant Material: Premium PVC Rubber (long-lasting &amp; realistic) Planter: Durable White Ceramic Pot with Textured Design Fillings: Decorative Pebbles for a natural look Height: Approx. 4.5 ft (including pot) âœ¨ Key Features: Lifelike design â€“ brings nature indoors without maintenance Strong &amp; durable PVC rubber leaves â€“ fade-resistant and washable Stylish ceramic planter â€“ enhances modern home &amp; office dÃ©cor Perfect for living rooms, bedrooms, offices, balconies, restaurants &amp; hotels Zero maintenance â€“ no watering, trimming, or sunlight required	0	200	2026-02-04 00:37:58.437276+05	[{"name": "size", "options": ["4.5"], "required": true, "priceAdjustments": {"4.5": 0}}]	{}	{artificial-plants}
113	Tall Artificial Areca Palm Plant with Wooden Barrel Planter Indoor & Outdoor Decorative Palm Tree for Home & Office Decor	6000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_6.jpg	artificial-plants	Decor	4.1	16	\N	Product Details Plant Name: Areca Palm (Artificial) Height: 4.5 ft Weight: 1.5 kg (approx.) Planter Material: Wooden barrel style Plant Material: PVC rubber Suitable For: Indoor and shaded outdoor spaces	43	200	2026-02-04 00:37:58.438959+05	[{"name": "size", "options": ["4.5 ft"], "required": true, "priceAdjustments": {"4.5 ft": 0}}]	{}	{artificial-plants}
108	Modern Wavy Wall Mirror Set Decorative Wall Mounted Mirror for Living Room, Bedroom & Hallway	15000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_8_2.jpg	wall-mirrors	Decor	4.4	12	\N	âœ” Modern wavy design â€“ contemporary and stylish look âœ” High-quality crystal clear reflection âœ” Wall-mounted â€“ easy installation and space saving âœ” Perfect for living room, bedroom, hallway &amp; office dÃ©cor âœ” Multipurpose use â€“ decor + functional mirror Material: Premium Mirror Glass with Smooth Edges Size: Multiple Piece Set (Wavy Cut Design) Color: Clear Glass with Silver Edging Style: Modern / Contemporary	20	500	2026-02-04 00:37:58.433842+05	[{"name": "size", "options": ["5 ft"], "required": true, "priceAdjustments": {"5 ft": 0}}]	{}	{wall-mirrors}
79	Round Ceramic Pot with Artificial Pink Lotus Flowers â€“ Decorative Flower Vase for Home & Office	3500	\N	https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80	artificial-plants	Decor	4.3	33	\N	Bring natural beauty to your space with this round ceramic pot featuring artificial pink lotus flowers and lush green leaves . The elegant glossy ceramic vase complements the lifelike flowers, making it a perfect centerpiece for living rooms, bedrooms, offices, or entryways . No maintenance needed, just long-lasting beauty for your interiors. Cosmo Decorpk Uncategorized TRUE Height 2.5 ft Pot colors yellow 0 shopify 50 deny manual 3800 TRUE TRUE https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.24PM.jpg?v=1757611775 1	0	200	2026-02-04 00:37:58.402752+05	[]	{}	{artificial-plants}
90	Set of 3 Black & Gold Ceramic Vases and Decorative Jars â€“ Luxury Home Decor with Intricate Patterns	12000	\N	https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80	vases	Decor	4.5	39	\N	Elevate your interiors with this striking set of 3 ceramic vases and jars in black and gold. Designed with intricate patterns and a shiny finish, these pieces bring a touch of luxury and sophistication to any space. Perfect for living rooms, consoles, dining tables, or as a statement gift. Cosmo Decorpk Home & Garden > Decor > Vases TRUE set SET OF 3 0 shopify 0 deny manual 17000 TRUE TRUE https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image6.jpg?v=1757529568 1	0	200	2026-02-04 00:37:58.415632+05	[]	{}	{vases}
45	 Yellow Chalk Pot with Metal Stand 	5500	\N	https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770402434/image6_3_yxuni3.jpg	floral-plants	Decor	4.6	44		this Yellow Chalk Pot on a Metal Stand, standing tall at 5 feet. The vibrant yellow pot paired with lush artificial greenery and soft yellow feathers brings warmth and energy to any interior. 	0	700	2026-02-04 00:37:58.293251+05	[{"name": "Stand", "options": ["With stand", "without stand"], "required": false, "priceAdjustments": {"With stand": 1000, "without stand": 0}}]	{}	{floral-plants}
67	 Square Cube Pendant Light 	3000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-12at9.08.58PM.jpg	lighting-lamps	Decor	4.3	5		Single square cube pendant light in geometric cage design Modern industrial style with matte black finish Durable metal construction for long-lasting use Adjustable cord for customized height placement Compatible with E27 bulbs (LED, Edison, or warm light)	5	350	2026-02-04 00:37:58.388811+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
68	Rustic 3 Light Cage Pendant Chandelier	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-12at9.08.57PM.jpg	lighting-lamps	Decor	4.6	33		 Set of 3 rustic cage pendant lights with rope detailing Industrial black metal finish for farmhouse style Adjustable cords for different ceiling heights Compatible with E27 bulbs (LED, Edison, or warm light recommended)	14	500	2026-02-04 00:37:58.389804+05	[{"name": "Set", "options": ["1", "3"], "required": true, "priceAdjustments": {"1": 0, "3": 3000}}]	{}	{lighting-lamps}
69	ustic Cage tVintage Hanging Ceiling Lamp	3500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-12at9.08.58PM_1.jpg	lighting-lamps	Decor	4.2	34		 Rustic black metal cage design with rope accent Warm vintage style for cozy ambiance Sturdy and durable construction Compatible with E27 bulb (LED, Edison, or warm light recommended)	5	200	2026-02-04 00:37:58.390785+05	[{"name": "size", "options": ["3 ft"], "required": true, "priceAdjustments": {"3 ft": 0}}]	{}	{lighting-lamps}
70	 3 Hanging Cage Design Ceiling Chandelier	4000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-12at9.08.59PM.jpg	lighting-lamps	Decor	4.7	26		 3 hanging geometric cage pendant lights Durable metal construction with matte black finish Modern and industrial design for versatile dÃ©cor Adjustable cords for customizable height Perfect for home, office, cafÃ©, and restaurant lighting	5	500	2026-02-04 00:37:58.391729+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
81	Golden Crystal Table Lamps with Fabric Shade â€“ Set of 2, Elegant Decorative Lighting (18 Inch)	10800	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.22PM.jpg	lighting-lamps	Decor	4.2	22	\N	âœ¨ Features: Set of 2 luxury golden table lamps Elegant crystal-inspired design with glossy finish Premium golden fabric lampshade for cozy ambient light Height: 18 inches â€“ ideal for bedside, side tables &amp; consoles Perfect for bedrooms, living rooms, offices, or gifting Upgrade your interior with these luxury decorative lamps that blend elegance, style, and functionality	6	500	2026-02-04 00:37:58.404928+05	[{"name": "SIZE", "options": ["18 inch height"], "required": true, "priceAdjustments": {"18 inch height": 0}}]	{}	{lighting-lamps}
82	Blue Versace-Inspired Ceramic Table Lamp with Fabric Shade â€“ Luxury Decorative Lighting (18 Inch)	10500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.23PM_1.jpg	lighting-lamps	Decor	4.5	41	\N	Features: Elegant blue ceramic body with Versace-inspired design Premium fabric lampshade for warm, soft lighting Height: 18 inches â€“ ideal for bedside &amp; side tables Stylish statement piece for luxury-inspired dÃ©cor Perfect for bedrooms, living rooms, offices, or gifting Transform your space with this designer-inspired lamp that combines fashion, functionality, and a touch of vibrant color.	6	500	2026-02-04 00:37:58.40594+05	[{"name": "Size", "options": ["18 inch height"], "required": true, "priceAdjustments": {"18 inch height": 0}}]	{}	{lighting-lamps}
83	Versace-Inspired Ceramic Table Lamp with Fabric Shade â€“ Luxury Decorative Lighting	10500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/WhatsAppImage2025-09-11at3.58.22PM_1.jpg	lighting-lamps	Decor	4.7	30	\N	Features: Premium ceramic body with Versace-inspired design Elegant fabric lampshade for soft ambient lighting Height: 18 inches â€“ perfect for bedside &amp; side tables Blends modern style with luxury-inspired dÃ©cor Ideal for bedrooms, living rooms, offices, or as a gift This designer-inspired ceramic lamp brings fashion and functionality together, making it a standout piece for any home.	6	500	2026-02-04 00:37:58.407197+05	[{"name": "Size", "options": ["18 Inch height"], "required": true, "priceAdjustments": {"18 Inch height": 0}}]	{}	{lighting-lamps}
92	Premium Horse Body Lamp with Shade | 3.5 ft Tall Decorative Floor Lamp	22000	22000	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/image2.jpg	lighting-lamps	Decor	4.5	7	\N	Add a touch of luxury and elegance to your home with this Premium Horse Body Lamp with Shade , standing 3.5 feet tall . Designed with a detailed horse-shaped body and a stylish fabric lampshade, this lamp is the perfect blend of art and functionality . Ideal for living rooms, bedrooms, offices, or luxury interiors , this lamp provides warm ambient lighting while doubling as a unique dÃ©cor statement piece . Its sturdy build and premium finish make it a standout addition to any modern or classic setting. Features: Height: 3.5 ft Unique horse body design with premium detailing Comes with a fabric lampshade for warm, ambient light Sturdy base for durability and long-lasting use Perfect for living rooms, bedrooms, offices, hotels, and lobbies Works as both functional lighting and luxury dÃ©cor	4	500	2026-02-04 00:37:58.417502+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
97	18 Inch Table Lamp with Shade Modern Bedside & Living Room Lighting	12500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_1_3.jpg	lighting-lamps	Decor	4.2	22	\N	Features: 18-inch table lamp with premium fabric shade Perfect for bedside tables, nightstands, living rooms, and offices Provides soft, warm, and cozy lighting Durable design with a stylish, minimalist look Ideal for modern, classic, or luxury home dÃ©cor	5	500	2026-02-04 00:37:58.422736+05	[{"name": "size", "options": ["18 inch"], "required": true, "priceAdjustments": {"18 inch": 0}}]	{}	{lighting-lamps}
98	Ceramic Table Lamp with Marble Vein Design	12500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_2_6.jpg	lighting-lamps	Decor	4.3	24	\N	Features: Stylish vase-shaped ceramic base with marble vein effect Neutral fabric shade for soft and ambient light Durable and elegant craftsmanship Perfect for bedside, living room, or office dÃ©cor A classic statement piece to complement any interior style	5	500	2026-02-04 00:37:58.423548+05	[{"name": "size", "options": ["Standard"], "required": true, "priceAdjustments": {"Standard": 0}}]	{}	{lighting-lamps}
99	Modern Gold & Ceramic Table Lamp with Fabric Shade	11500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_6_3.jpg	lighting-lamps	Decor	4.4	47	\N	Features: Stylish two-tone ceramic base (black &amp; white) with golden accents Premium fabric lampshade for soft, warm lighting Durable and modern design Perfect for bedside tables, living rooms, and workspaces Elegant statement piece for any dÃ©cor	5	500	2026-02-04 00:37:58.424419+05	[{"name": "size", "options": ["standard size"], "required": true, "priceAdjustments": {"standard size": 0}}]	{}	{lighting-lamps}
100	Marble Base Table Lamp with Fabric Shade	12500	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_5_3.jpg	lighting-lamps	Decor	4.0	9	\N	Features: Premium marble-style base with natural patterns Elegant golden detailing for a luxurious look Soft fabric lampshade for warm, ambient lighting Durable and stylish design Ideal for bedrooms, living rooms, or office spaces	5	500	2026-02-04 00:37:58.425268+05	[{"name": "size", "options": ["13 inch height"], "required": true, "priceAdjustments": {"13 inch height": 0}}]	{}	{lighting-lamps}
101	Ceramic Table Lamp with Fabric Shade | Modern Bedside & Living Room Light	12700	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_4_5.jpg	lighting-lamps	Decor	4.4	15	\N	Features: Premium ceramic base with geometric gold design Classic fabric lampshade for soft light diffusion Suitable for bedroom, living room, office, or study Works with standard LED or bulb fittings Elegant and durable design for long-lasting dÃ©cor	10	500	2026-02-04 00:37:58.426166+05	[{"name": "Color", "options": ["black"], "required": true, "priceAdjustments": {"black": 0}}]	{}	{lighting-lamps}
106	Modern Crystal Shade Table Lamp | Touch Control LED with 3 Light Modes	3000	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_7_2.jpg	lighting-lamps	Decor	4.5	34	\N	Give your home a stylish upgrade with this Modern Crystal Shade Table Lamp , designed with a clear crystal-textured lampshade and golden metal base. Its elegant and minimal design makes it a perfect fit for bedrooms, living rooms, side tables, or office dÃ©cor . With a built-in touch sensor , you can easily switch between 3 light color modes â€“ Warm, Cool &amp; Neutral White to create the perfect atmosphere for reading, relaxing, or adding a soft glow to your space. Features: Premium crystal shade with golden metal base Touch control for easy operation 3 adjustable LED light colors (Warm, Cool &amp; Neutral White) Energy-saving and durable LED design Compact &amp; elegant â€“ ideal for bedroom, living room, office, or gifting	20	200	2026-02-04 00:37:58.431461+05	[{"name": "Quantity", "options": ["1 pc"], "required": true, "priceAdjustments": {"1 pc": 0}}]	{}	{lighting-lamps}
107	Luxury Crystal Table Lamp | Modern LED Decorative Light for Living Room & Bedroom | 3 light modes	2200	\N	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_6_2.jpg	lighting-lamps	Decor	4.5	10	\N	Features: Premium quality crystal &amp; golden metal finish Touch control for easy operation 3 adjustable light colors (Warm, Cool &amp; Natural White) Energy-efficient LED technology Stylish oval design for modern home dÃ©cor Perfect for side tables, nightstands, living rooms &amp; gifting	39	200	2026-02-04 00:37:58.432614+05	[{"name": "Quantity", "options": ["Single pc"], "required": true, "priceAdjustments": {"Single pc": 0}}]	{}	{lighting-lamps}
28	Ramadan Moon Candle Holder	2500	4850	https://cdn.shopify.com/s/files/1/0899/9301/9639/files/photo-output_5_9.jpg	ramadan-decor	Decor	4.1	6		Ramadan Kareem Moon Shape Candle Holder...	20	200	2026-02-04 00:22:58.299443+05	[{"name": "Material", "options": ["resin"], "required": true, "priceAdjustments": {"resin": 0}}, {"name": "size", "options": ["8 inch height"], "required": true, "priceAdjustments": {"8 inch height": 0}}]	{}	{ramadan-decor}
71	Flower Arrangement in Round Pink Ceramic Pot 	5800	\N	https://res.cloudinary.com/dbhcpgyvh/image/upload/v1770480983/WhatsApp_Image_2025-09-12_at_5.18.00_PM_s4qjeu.jpg	floral-plants	Decor	5	1		\n✔ Beautiful Artificial Flowers Lifelike design for a fresh look all year\n✔ Low Maintenance No watering or sunlight required\n✔ Compact & Elegant Perfect for coffee tables, shelves, bedrooms, and offices\n✔ Versatile Gift Idea A thoughtful décor piece for loved ones	10	800	2026-02-04 00:37:58.392747+05	[]	{}	{floral-plants}
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, rating, comment, reviewer_name, reviewer_email, review_date, picture_urls, verified_purchase, status, created_at) FROM stdin;
1	116	5	I ordered this mirror and honestly I wasnâ€™t expecting it to look this good! The quality is solid, finishing is neat and it completely changed the look of my room. Packing was safe too, it arrived without any damage. Totally worth it!	ALINA	malaikaajmal61@gmail.com	2025-09-11 11:40:04	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1757590804__whatsappimage2025-09-11at43909pm__original.jpeg}	t	approved	2026-02-04 18:19:54.259088
2	105	5	I got it in their 3800 dealâ€¦ plant, planter & stones all together! Honestly so worth it and Iâ€™m loving the quality ðŸ™Œ	SABA	ishaajmal430@gmail.com	2025-09-11 11:48:55	{}	t	approved	2026-02-04 18:19:54.263798
3	95	5	Fast delivery\nAnd amazing quality	Ishaajmal	ishaajmal430@gmail.com	2025-09-11 16:14:57	{}	t	approved	2026-02-04 18:19:54.265778
4	116	5	I'm absolutely thrilled with Cosmodecor! As someone who's always on the lookout for unique and stylish home decor and mirrors, I stumbled upon this page, and it's been a revelation. The variety of products is staggering, and the quality is top-notch.	Hamid khan	hamidkhan465326@gmail.com	2025-09-12 09:45:08	{}	t	approved	2026-02-04 18:19:54.266578
5	116	5	In short, Cosmodecor is a must-visit destination* for anyone looking to elevate their home's style and sophistication. I'm so grateful to have found this platform, and I look forward to exploring more of their offerings in the future! ðŸ˜Š\n\n*Highly recommended! ðŸ‘	Hameed	hameedkarzai385@gmail.com	2025-09-12 09:49:20	{}	t	approved	2026-02-04 18:19:54.267191
6	42	5	quality was so good , ðŸ¥¹ like i was literally questioning them that why is for 2500 ? it worths more than 2500 \nloved it	Fazal	l33942603@gmail.com	2025-10-21 19:37:53	{}	t	approved	2026-02-04 18:19:54.267915
7	42	5	worth the price , would rate it a 10 out of 10 product	Haideralirajput	haideralirajputofficial@gmail.com	2025-10-21 19:40:34	{}	t	approved	2026-02-04 18:19:54.27002
8	42	4	jesi dekhai thi wese he recv hue hai , will share pics too	Ishaa	ishaajmal430@gmail.com	2025-10-21 19:42:29	{}	t	approved	2026-02-04 18:19:54.271019
9	42	4	jesi dekhaye thi wese he meli \naj he mela parcel	Ishaajmal	ishaajmal430@gmail.com	2025-10-21 19:43:14	{}	t	approved	2026-02-04 18:19:54.271595
10	86	5	Quality is so good. Owner was so cooperative and delivered the way its ordered. Highly recommended.	Hadiqa	hadiqashahroom641@gmail.com	2025-10-24 07:17:24	{}	t	approved	2026-02-04 18:19:54.272204
11	42	5	I received my parcel ðŸ“¦ top notch quality carefully packed and I literally loved the plant and the price is so reasonable ðŸ˜ will shop again Insha'Allah	Bisma	aroojbisma37@gmail.com	2025-10-24 07:23:09	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1761290589__1000662665__original.jpg}	t	approved	2026-02-04 18:19:54.2743
12	50	5	Love this lamp! Looks modern and perfect for adding ambiance!	Aaiza	aaiza.mehmoods21@gmail.com	2025-10-24 13:31:03	{}	t	approved	2026-02-04 18:19:54.275951
13	42	5	Amazing quality plus the price omg..totally satisfied will surely shop again	Alisha	alisha.khalils21@gmail.com	2025-10-24 14:23:45	{}	t	approved	2026-02-04 18:19:54.276797
14	42	5	mam \nHope you are doing well. \nJust received my parsel. ðŸ’¯% Satisfied. Good quality, quick delivery, fast services.\nKeep it up and best of luckðŸŒ¸ðŸŒ¹â¤ï¸	Malaikaajmal	malaikaajmal61@gmail.com	2025-11-01 16:34:00	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762014841__1451e55b-ad5a-43c0-a721-baeb014b5cb3__original.jpeg}	t	approved	2026-02-04 18:19:54.277349
15	42	5	Sorry I'm giving late review.. Actually my weekend was soo busy , the planter I ordered from you(cosmodecor) is amazing this decorative planter adds a beautiful touch to my space.\n will shop again from cosmodecor insha Allah	Fatima Zeesahan	fatimaajmal9256@gmail.com	2025-11-05 15:26:49	{}	t	approved	2026-02-04 18:19:54.277821
16	49	5	I received my order and I m very happy with the quality and packaging. \nThe item looks even better in person and fits beautifully with my home decor. \nThank you COSMODECORPK for the excellent service and quick delivery â¤ï¸	zuhra	malaikaajmal61@gmail.com	2025-11-07 11:24:47	{}	t	approved	2026-02-04 18:19:54.278649
17	49	5	Asslam o alikum kesi hai app mujy parcel receive ho gya hai or Boht acha hai mujy Pasand aya once again thank you so much â¤ï¸	Arsalan ashiq	malaikaajmal61@gmail.com	2025-11-07 11:28:21	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762514901__64c0582d-2cff-4c74-98b0-43ba734f3f3b__original.jpeg}	t	approved	2026-02-04 18:19:54.279319
18	71	5	it's beautiful	Asad arain	malaikaajmal61@gmail.com	2025-11-07 11:30:52	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762515052__874d02a7-ebff-4985-9587-fcd32a292cde__original.jpeg}	t	approved	2026-02-04 18:19:54.280048
19	42	5	Loved it	Aleza kaashi	malaikaajmal61@gmail.com	2025-11-14 11:41:41	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763120502__983d811d-4a08-40fc-ac41-f2ea74bc6778__original.jpeg}	t	approved	2026-02-04 18:19:54.280767
20	42	5	Lovely	Fatima	malaikaajmal61@gmail.com	2025-11-14 11:45:55	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763120756__img_8772__original.png}	t	approved	2026-02-04 18:19:54.28149
21	42	5	What a lovely plants amazing ðŸ˜	Wamar	malaikaajmal61@gmail.com	2025-11-19 15:14:41	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763565281__ac058fec-3caf-427b-8078-3ce5097bc6a0__original.jpeg}	t	approved	2026-02-04 18:19:54.282198
22	34	5	Loved the finishing	Salina	malaikaajmal61@gmail.com	2025-11-19 15:16:02	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763565362__img_8958__original.png}	t	approved	2026-02-04 18:19:54.28318
23	48	5	Best best best	Ridaa Fatima	ridaa.fatima34@gmail.com	2025-12-05 13:35:30	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1764941761__1764941758757-7a4cd515-3c33-4aa9-b208-05__original.jpeg}	t	approved	2026-02-04 18:19:54.285698
24	49	5	Cute	Anabia	malaikaajmal61@gmail.com	2025-12-30 15:14:16	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1767107656__479fbc88-e7a5-4ed9-ad7d-a182f19cf688__original.jpeg}	t	approved	2026-02-04 18:19:54.286278
25	17	5	Lovely	Salina	malaikaajmal61@gmail.com	2026-01-28 14:00:12	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769608812__e71698d1-b54a-4f19-8b6d-18ff313253e7__original.jpeg}	t	approved	2026-02-04 18:19:54.287285
26	17	5	as expected	ashahna	ishaajmal430@gmail.com	2026-01-30 13:07:54	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778475__1000441187__original.jpg}	t	approved	2026-02-04 18:19:54.28802
27	17	5	price zayada honi chia quality k hisab sa best deal	anaya	ishaajmal430@gmail.com	2026-01-30 13:08:49	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778529__1000441188__original.jpg}	t	approved	2026-02-04 18:19:54.288752
28	42	5	plantar ki quality boht achi hai	Salina	malaikaajmal61@gmail.com	2026-01-30 13:10:09	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778609__1000441188__original.jpg}	t	approved	2026-02-04 18:19:54.289434
29	42	5	Beautiful	Salina	malaikaajmal61@gmail.com	2026-01-30 13:10:49	{https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778649__1000441187__original.jpg}	t	approved	2026-02-04 18:19:54.290013
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, name, location, image_url, rating, message, created_at) FROM stdin;
1	Alina	Karachi	https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1757590804__whatsappimage2025-09-11at43909pm__original.jpeg	5	I ordered this mirror and honestly I wasn’t expecting it to look this good! The quality is solid, finishing is neat and it completely changed the look of my room. Packing was safe too, it arrived without any damage. Totally worth it!	2026-02-06 00:18:14.770845+05
2	Hamid Khan	Lahore	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop	5	I'm absolutely thrilled with Cosmodecor! As someone who's always on the lookout for unique and stylish home decor and mirrors, I stumbled upon this page, and it's been a revelation. The variety of products is staggering, and the quality is top-notch.	2026-02-06 00:18:14.778661+05
3	Bisma	Islamabad	https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1761290589__1000662665__original.jpg	5	I received my parcel 📦 top notch quality carefully packed and I literally loved the plant and the price is so reasonable 🌟 will shop again Insha'Allah	2026-02-06 00:18:14.7795+05
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, first_name, phone, created_at) FROM stdin;
1	Admin User	admin@cosmodecor.pk	$2b$10$..WV18RZVSqXUkl12GzLzenW51poUYs.rbMA1kABykZxEEsm8HC7i	admin	\N	\N	2026-02-01 21:00:25.800728+05
1769962921777	Hucen Mehdi	hussainmehdi311@gmail.com	$2b$10$bqw1XWc6qvaD3Xr2Zz77S.oi6Rce0unhfUZxDAy6nwwm6gCVhZAeC	admin	\N	\N	2026-02-01 21:22:01.778101+05
1770127848771	Cosmo	muhammadhucen2@gmail.com	$2b$10$.hcbaQfvhCKkEooAdGdCt.1Ybsw2lg0dNYAb0pDTpYNI5WeyiNxSm	user	\N	\N	2026-02-03 19:10:48.772191+05
1770132246422	Hucen	ishaajmal430@gmail.com	$2b$10$RKVfs4MZMvft6qulJlygtOGX1JPyZW0L1NQt/ve5rMKFsqQDJwNES	user	\N	\N	2026-02-03 20:24:06.423736+05
1770137100344	Malalaika	malaikaajmal61@gmail.com	$2b$10$vF3tFpznO3TfNozAT2qzm.AkLiRVhs1UE9sgp7IU48ygTym2nWzea	admin	\N	\N	2026-02-03 21:45:00.344882+05
1770139903727	Muhammad Hassan	Haccan96@gmail.com	$2b$10$BH9EZyp1UVud4DEwiBMKV.8vKAdhXBkawIA9plyV9Q8UMdjL7xDHu	user	\N	\N	2026-02-03 22:31:43.728371+05
1770153038482	hoor bhutto	bhuttohoorunnisa@gmail.com	$2b$10$idbdQU7xdeUnrI5g4McHreO0Oq5BxogpRL.NM3ny/BXPQH9ekbizi	user	\N	\N	2026-02-04 02:10:38.483676+05
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (user_id, product_id, created_at) FROM stdin;
\.


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 32, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 20, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 117, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 29, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 3, true);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (user_id, product_id);


--
-- Name: idx_reviews_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GS4JUgBFt5KlxUkIVh5aP60PxApGapZsSKBp36Jv7algSr5k7wS6BfIdl5NJF5a

