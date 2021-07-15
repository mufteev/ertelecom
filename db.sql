--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: history; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA history;


ALTER SCHEMA history OWNER TO postgres;

--
-- Name: info; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA info;


ALTER SCHEMA info OWNER TO postgres;

--
-- Name: info_price; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA info_price;


ALTER SCHEMA info_price OWNER TO postgres;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: save(text, text, uuid, uuid, integer, uuid, uuid, integer, timestamp with time zone); Type: FUNCTION; Schema: history; Owner: postgres
--

CREATE FUNCTION history.save(p_company_name text, p_company_tin text, p_city_id uuid, p_type_provision_id uuid, p_users_count integer, p_archive_depth_id uuid, p_type_storage_id uuid, p_period_service integer, p_create_at timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  d_client_id         UUID;
  d_order_id          UUID;
  d_license_config_id UUID;
BEGIN
  d_license_config_id := (
    SELECT lc.id
    FROM info_price.license_config lc
           JOIN info_price.license_range lr ON lr.id = lc.license_range_id
    WHERE p_users_count BETWEEN lr.user_from AND lr.user_to
  );

  INSERT INTO history.client(name, tin)
  VALUES (p_company_name, p_company_tin)
  RETURNING id INTO d_client_id;

  INSERT INTO history.calc
  (city_id,
   type_provision_id,
   users_count,
   client_id,
   archive_depth_id,
   type_storage_id,
   period_service,
   create_at,
   license_config_id)
  VALUES (p_city_id,
          p_type_provision_id,
          p_users_count,
          d_client_id,
          p_archive_depth_id,
          p_type_storage_id,
          p_period_service,
          p_create_at,
          d_license_config_id)
  RETURNING id INTO d_order_id;

  RETURN jsonb_build_object(
    'client_id', d_client_id,
    'order_id', d_order_id);
END;
$$;


ALTER FUNCTION history.save(p_company_name text, p_company_tin text, p_city_id uuid, p_type_provision_id uuid, p_users_count integer, p_archive_depth_id uuid, p_type_storage_id uuid, p_period_service integer, p_create_at timestamp with time zone) OWNER TO postgres;

--
-- Name: get_unit_cost_value(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_unit_cost_value(unit_id text) RETURNS numeric
    LANGUAGE plpgsql
    AS $$

DECLARE

  value DECIMAL;

BEGIN

  SELECT uc.value

  FROM info_price.unit_cost uc

  WHERE uc.id = unit_id

  INTO value;



  RETURN value;

END;

$$;


ALTER FUNCTION public.get_unit_cost_value(unit_id text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calc; Type: TABLE; Schema: history; Owner: postgres
--

CREATE TABLE history.calc (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    city_id uuid NOT NULL,
    type_provision_id uuid NOT NULL,
    users_count integer NOT NULL,
    client_id uuid NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    archive_depth_id uuid NOT NULL,
    type_storage_id uuid NOT NULL,
    period_service integer NOT NULL,
    license_config_id uuid NOT NULL
);


ALTER TABLE history.calc OWNER TO postgres;

--
-- Name: client; Type: TABLE; Schema: history; Owner: postgres
--

CREATE TABLE history.client (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    tin text NOT NULL
);


ALTER TABLE history.client OWNER TO postgres;

--
-- Name: TABLE client; Type: COMMENT; Schema: history; Owner: postgres
--

COMMENT ON TABLE history.client IS 'Информация о клиенте';


--
-- Name: archive_depth; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.archive_depth (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    depth integer NOT NULL
);


ALTER TABLE info.archive_depth OWNER TO postgres;

--
-- Name: TABLE archive_depth; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.archive_depth IS 'Глубина архива';


--
-- Name: city; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.city (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL
);


ALTER TABLE info.city OWNER TO postgres;

--
-- Name: TABLE city; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.city IS 'Город';


--
-- Name: type_provision; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.type_provision (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL
);


ALTER TABLE info.type_provision OWNER TO postgres;

--
-- Name: TABLE type_provision; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.type_provision IS 'Тип предоставления';


--
-- Name: type_storage_service; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.type_storage_service (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    type text[]
);


ALTER TABLE info.type_storage_service OWNER TO postgres;

--
-- Name: TABLE type_storage_service; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.type_storage_service IS 'Вариант использования услуги ';


--
-- Name: license_config; Type: TABLE; Schema: info_price; Owner: postgres
--

CREATE TABLE info_price.license_config (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    bandwidth_channel numeric NOT NULL,
    license_range_id uuid NOT NULL,
    vcpu integer NOT NULL,
    ram integer,
    hdd_capacity integer NOT NULL,
    ssd_capacity integer NOT NULL,
    coefficient_rate_appeal_to_support numeric NOT NULL,
    number integer,
    cost_license numeric(1000,2)
);


ALTER TABLE info_price.license_config OWNER TO postgres;

--
-- Name: license_range; Type: TABLE; Schema: info_price; Owner: postgres
--

CREATE TABLE info_price.license_range (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_from integer NOT NULL,
    user_to integer NOT NULL
);


ALTER TABLE info_price.license_range OWNER TO postgres;

--
-- Name: view_configuration_part_first; Type: VIEW; Schema: info_price; Owner: postgres
--

CREATE VIEW info_price.view_configuration_part_first AS
 SELECT lc.id,
    lc.name,
    lc.number,
    lc.bandwidth_channel,
    lr.user_from,
    lr.user_to,
    lc.cost_license,
    lc.vcpu,
    lc.ram,
    lc.hdd_capacity,
    lc.ssd_capacity,
    ((((lc.vcpu)::numeric * public.get_unit_cost_value('cost_vcpu_per_core'::text)) + ((lc.ram)::numeric * public.get_unit_cost_value('cost_ram_per_gb'::text))) + ((lc.hdd_capacity)::numeric * public.get_unit_cost_value('cost_hdd_per_gb'::text))) AS vm_technical_resource,
    (lc.bandwidth_channel * public.get_unit_cost_value('cost_network_erth_magistral'::text)) AS network_technical_resource,
    lc.coefficient_rate_appeal_to_support,
    ((((lc.coefficient_rate_appeal_to_support * public.get_unit_cost_value('support_count_request'::text)) * public.get_unit_cost_value('support_duration_solve'::text)) * public.get_unit_cost_value('support_cost'::text)) / public.get_unit_cost_value('work_minutes_per_month'::text)) AS cost_human_support,
    ((((lc.coefficient_rate_appeal_to_support * public.get_unit_cost_value('duty_engineer_count_request'::text)) * public.get_unit_cost_value('duty_engineer_duration_solve'::text)) * public.get_unit_cost_value('duty_engineer_cost'::text)) / public.get_unit_cost_value('work_minutes_per_month'::text)) AS cost_human_duty_engineer,
    ((public.get_unit_cost_value('deploy_duration'::text) * public.get_unit_cost_value('cost_operation_resource'::text)) / public.get_unit_cost_value('work_minutes_per_month'::text)) AS cost_human_operation
   FROM (info_price.license_config lc
     JOIN info_price.license_range lr ON ((lr.id = lc.license_range_id)));


ALTER TABLE info_price.view_configuration_part_first OWNER TO postgres;

--
-- Name: view_configuration_part_second; Type: VIEW; Schema: info_price; Owner: postgres
--

CREATE VIEW info_price.view_configuration_part_second AS
 SELECT vcpf.id,
    vcpf.name,
    vcpf.number,
    vcpf.bandwidth_channel,
    vcpf.user_from,
    vcpf.user_to,
    vcpf.cost_license,
    vcpf.vcpu,
    vcpf.ram,
    vcpf.hdd_capacity,
    vcpf.ssd_capacity,
    vcpf.vm_technical_resource,
    vcpf.network_technical_resource,
    vcpf.coefficient_rate_appeal_to_support,
    vcpf.cost_human_support,
    vcpf.cost_human_duty_engineer,
    vcpf.cost_human_operation,
    ((((vcpf.vm_technical_resource + vcpf.network_technical_resource) + vcpf.cost_human_support) + vcpf.cost_human_duty_engineer) + vcpf.cost_human_operation) AS total_cost_resource_without_marginality,
    (((((vcpf.vm_technical_resource + vcpf.network_technical_resource) + vcpf.cost_human_support) + vcpf.cost_human_duty_engineer) + vcpf.cost_human_operation) * ((1)::numeric + public.get_unit_cost_value('marginality_erth'::text))) AS total_cost_resource_with_marginality,
    ((vcpf.user_to)::numeric * vcpf.cost_license) AS cost_license_without_marginality,
    (((vcpf.user_to)::numeric * vcpf.cost_license) * ((1)::numeric + public.get_unit_cost_value('marginality_partner_product'::text))) AS cost_license_with_marginality
   FROM info_price.view_configuration_part_first vcpf;


ALTER TABLE info_price.view_configuration_part_second OWNER TO postgres;

--
-- Name: view_configuration_total; Type: VIEW; Schema: info_price; Owner: postgres
--

CREATE VIEW info_price.view_configuration_total AS
 SELECT vcps.id,
    vcps.name,
    vcps.number,
    vcps.bandwidth_channel,
    vcps.user_from,
    vcps.user_to,
    vcps.cost_license,
    vcps.vcpu,
    vcps.ram,
    vcps.hdd_capacity,
    vcps.ssd_capacity,
    vcps.vm_technical_resource,
    round(vcps.network_technical_resource, 2) AS network_technical_resource,
    vcps.coefficient_rate_appeal_to_support,
    round(vcps.cost_human_support, 2) AS cost_human_support,
    round(vcps.cost_human_duty_engineer, 2) AS cost_human_duty_engineer,
    round(vcps.cost_human_operation, 2) AS cost_human_operation,
    round(vcps.total_cost_resource_without_marginality, 2) AS total_cost_resource_without_marginality,
    round(vcps.total_cost_resource_with_marginality, 2) AS total_cost_resource_with_marginality,
    vcps.cost_license_without_marginality,
    vcps.cost_license_with_marginality,
    round((vcps.total_cost_resource_with_marginality + vcps.cost_license_with_marginality), 2) AS total_per_month,
    round(((vcps.total_cost_resource_with_marginality + vcps.cost_license_with_marginality) / (vcps.user_to)::numeric), 2) AS cost_per_user
   FROM info_price.view_configuration_part_second vcps
  ORDER BY vcps.number;


ALTER TABLE info_price.view_configuration_total OWNER TO postgres;

--
-- Name: view_license_base; Type: VIEW; Schema: info_price; Owner: postgres
--

CREATE VIEW info_price.view_license_base AS
 SELECT view_configuration_total.id AS license_config_id,
    view_configuration_total.number,
    view_configuration_total.user_from,
    view_configuration_total.user_to,
    concat(view_configuration_total.user_from, '-', view_configuration_total.user_to) AS license_user_count_text,
    view_configuration_total.cost_license,
    (ceil(((((((((view_configuration_total.vcpu)::numeric * public.get_unit_cost_value('cost_vcpu_per_core'::text)) + ((view_configuration_total.ram)::numeric * public.get_unit_cost_value('cost_ram_per_gb'::text))) + view_configuration_total.network_technical_resource) + view_configuration_total.cost_human_support) + view_configuration_total.cost_human_duty_engineer) + view_configuration_total.cost_human_operation) / (100)::numeric)) * (100)::numeric) AS cost_vm_per_month,
    ((view_configuration_total.hdd_capacity)::numeric * public.get_unit_cost_value('cost_hdd_per_gb'::text)) AS cost_hdd_storage,
    ((view_configuration_total.ssd_capacity)::numeric * public.get_unit_cost_value('cost_ssd_per_gb'::text)) AS cost_ssd_storage
   FROM info_price.view_configuration_total;


ALTER TABLE info_price.view_license_base OWNER TO postgres;

--
-- Name: view_history; Type: VIEW; Schema: history; Owner: postgres
--

CREATE VIEW history.view_history AS
 SELECT c.id,
    c2.name AS company_name,
    tp.name AS type_provision,
    c2.tin,
    city.name AS city_name,
    c.users_count,
    c.period_service,
    c.create_at,
    ts.name AS type_storage_name,
    ts.type AS type_storage,
    ad.depth AS archive_depth,
        CASE (ts.type @> ARRAY['hdd'::text])
            WHEN true THEN ((((vlb.cost_license * (c.users_count)::numeric) + vlb.cost_vm_per_month) + (vlb.cost_hdd_storage * (ad.depth)::numeric)) * (c.period_service)::numeric)
            ELSE NULL::numeric
        END AS cost_service_hdd,
        CASE (ts.type @> ARRAY['ssd'::text])
            WHEN true THEN ((((vlb.cost_license * (c.users_count)::numeric) + vlb.cost_vm_per_month) + (vlb.cost_ssd_storage * (ad.depth)::numeric)) * (c.period_service)::numeric)
            ELSE NULL::numeric
        END AS cost_service_ssd,
        CASE (ts.type @> ARRAY['hdd'::text])
            WHEN true THEN (((vlb.cost_license * (c.users_count)::numeric) + vlb.cost_vm_per_month) + (vlb.cost_hdd_storage * (ad.depth)::numeric))
            ELSE NULL::numeric
        END AS cost_service_hdd_per_month,
        CASE (ts.type @> ARRAY['ssd'::text])
            WHEN true THEN (((vlb.cost_license * (c.users_count)::numeric) + vlb.cost_vm_per_month) + (vlb.cost_ssd_storage * (ad.depth)::numeric))
            ELSE NULL::numeric
        END AS cost_service_ssd_per_month
   FROM ((((((history.calc c
     JOIN info.city ON ((city.id = c.city_id)))
     JOIN history.client c2 ON ((c2.id = c.client_id)))
     JOIN info.type_provision tp ON ((tp.id = c.type_provision_id)))
     JOIN info.archive_depth ad ON ((ad.id = c.archive_depth_id)))
     JOIN info.type_storage_service ts ON ((ts.id = c.type_storage_id)))
     JOIN info_price.view_license_base vlb ON ((c.license_config_id = vlb.license_config_id)));


ALTER TABLE history.view_history OWNER TO postgres;

--
-- Name: competitor_solution; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.competitor_solution (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_from_competitor boolean NOT NULL
);


ALTER TABLE info.competitor_solution OWNER TO postgres;

--
-- Name: TABLE competitor_solution; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.competitor_solution IS 'Переход с решения конкурента';


--
-- Name: discount_education; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.discount_education (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_discount boolean NOT NULL
);


ALTER TABLE info.discount_education OWNER TO postgres;

--
-- Name: TABLE discount_education; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.discount_education IS 'Скидка для образовательных учреждений';


--
-- Name: individual_discount_perpetual_license; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.individual_discount_perpetual_license (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_discount boolean NOT NULL
);


ALTER TABLE info.individual_discount_perpetual_license OWNER TO postgres;

--
-- Name: TABLE individual_discount_perpetual_license; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.individual_discount_perpetual_license IS 'Индивидуальная скидка на бессрочную лицензию';


--
-- Name: individual_price_perpetual_license; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.individual_price_perpetual_license (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_individual_price boolean NOT NULL
);


ALTER TABLE info.individual_price_perpetual_license OWNER TO postgres;

--
-- Name: TABLE individual_price_perpetual_license; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.individual_price_perpetual_license IS 'Индивидуальная стоимость бессрочной лицензии';


--
-- Name: license_order; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.license_order (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.license_order OWNER TO postgres;

--
-- Name: TABLE license_order; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.license_order IS 'Тип покупки лицензии';


--
-- Name: license_renewal; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.license_renewal (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.license_renewal OWNER TO postgres;

--
-- Name: TABLE license_renewal; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.license_renewal IS 'Продление лицензии';


--
-- Name: license_term; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.license_term (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.license_term OWNER TO postgres;

--
-- Name: TABLE license_term; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.license_term IS 'Срок лицензии';


--
-- Name: order_change_type; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.order_change_type (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.order_change_type OWNER TO postgres;

--
-- Name: TABLE order_change_type; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.order_change_type IS 'Выбор изменений в заказе';


--
-- Name: order_terms; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.order_terms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    term text NOT NULL
);


ALTER TABLE info.order_terms OWNER TO postgres;

--
-- Name: TABLE order_terms; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.order_terms IS 'Условия заказа';


--
-- Name: premium_subscribe; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.premium_subscribe (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.premium_subscribe OWNER TO postgres;

--
-- Name: TABLE premium_subscribe; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.premium_subscribe IS 'Премиум подписка';


--
-- Name: support_premium; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.support_premium (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_need boolean NOT NULL
);


ALTER TABLE info.support_premium OWNER TO postgres;

--
-- Name: TABLE support_premium; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.support_premium IS 'Необходимость премиум ТП ';


--
-- Name: support_renewal; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.support_renewal (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.support_renewal OWNER TO postgres;

--
-- Name: TABLE support_renewal; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.support_renewal IS 'Продление ТП';


--
-- Name: support_renewal_period; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.support_renewal_period (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    period text NOT NULL
);


ALTER TABLE info.support_renewal_period OWNER TO postgres;

--
-- Name: TABLE support_renewal_period; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.support_renewal_period IS 'Срок продления ТП';


--
-- Name: support_technical; Type: TABLE; Schema: info; Owner: postgres
--

CREATE TABLE info.support_technical (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type text NOT NULL
);


ALTER TABLE info.support_technical OWNER TO postgres;

--
-- Name: TABLE support_technical; Type: COMMENT; Schema: info; Owner: postgres
--

COMMENT ON TABLE info.support_technical IS 'Тех. Поддержка';


--
-- Name: unit_cost; Type: TABLE; Schema: info_price; Owner: postgres
--

CREATE TABLE info_price.unit_cost (
    id text NOT NULL,
    name text NOT NULL,
    value numeric NOT NULL,
    unit_measure text,
    description text
);


ALTER TABLE info_price.unit_cost OWNER TO postgres;

--
-- Data for Name: calc; Type: TABLE DATA; Schema: history; Owner: postgres
--

COPY history.calc (id, city_id, type_provision_id, users_count, client_id, create_at, archive_depth_id, type_storage_id, period_service, license_config_id) FROM stdin;
3d0d38aa-c749-4ea8-bf03-664e4ea1f072	7a4e2cd1-4c42-47a1-807e-3823c9199308	47085981-c763-4779-aade-68a0aa52f564	1	1eb491a3-adcc-409f-a566-bf8c9c884ff1	2021-07-12 09:29:15.009125+00	1c92dca3-3520-4950-98ec-a1a88b2ae539	6be4d99c-1296-4f3c-ad50-bc8c6b6a29d0	1	6454151f-2e0d-4f78-ade6-34b52c79405e
3288b2b4-6f70-4fe7-8fac-d753e873ea35	dffa4c50-4718-4056-9d4d-e28df291d3e7	47085981-c763-4779-aade-68a0aa52f564	1	aaf0c84d-dcdd-4cd8-80d6-7d77ece5da2f	2021-07-12 10:00:27.045+00	1c92dca3-3520-4950-98ec-a1a88b2ae539	6be4d99c-1296-4f3c-ad50-bc8c6b6a29d0	1	6454151f-2e0d-4f78-ade6-34b52c79405e
3c033228-77d8-4f8f-99ba-18692be3a8a9	ee831c69-7a0e-4062-af84-19b5c80f0b60	47085981-c763-4779-aade-68a0aa52f564	3	d8969d91-b48d-4494-91d3-44e097330172	2021-07-12 12:50:26.376+00	6f41d9d7-d93d-4e88-ae26-2efef9fd0694	a1d5e0ca-df62-42bc-a537-d93da2962247	2	6454151f-2e0d-4f78-ade6-34b52c79405e
d07c7225-e94e-4c47-8313-d5d79f5e48e7	07d4139b-a0b0-49da-afaf-9248bb1448da	47085981-c763-4779-aade-68a0aa52f564	1	4c52fe30-8e82-4bbf-b393-2333cad23886	2021-07-12 17:17:20.524+00	1c92dca3-3520-4950-98ec-a1a88b2ae539	6be4d99c-1296-4f3c-ad50-bc8c6b6a29d0	1	6454151f-2e0d-4f78-ade6-34b52c79405e
1bb0a19e-1148-4472-a46c-5ee3e1326b77	ee831c69-7a0e-4062-af84-19b5c80f0b60	47085981-c763-4779-aade-68a0aa52f564	1	15a95901-c239-4580-8629-fc1bbda66fe3	2021-07-12 18:53:53.007+00	1c92dca3-3520-4950-98ec-a1a88b2ae539	6be4d99c-1296-4f3c-ad50-bc8c6b6a29d0	3	6454151f-2e0d-4f78-ade6-34b52c79405e
3a8f851c-e4c7-458d-959c-78739c5d67ae	7a4e2cd1-4c42-47a1-807e-3823c9199308	47085981-c763-4779-aade-68a0aa52f564	100	2b479eee-86c6-49f3-a7a8-58bf21475d7c	2021-07-13 21:46:37.494+00	61b26e59-f1fe-4960-ad80-f33028e32935	a1d5e0ca-df62-42bc-a537-d93da2962247	12	db1dced0-e89b-48e5-976b-47777645e85f
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: history; Owner: postgres
--

COPY history.client (id, name, tin) FROM stdin;
aaf0c84d-dcdd-4cd8-80d6-7d77ece5da2f	ООО Королькова	780204893183
1eb491a3-adcc-409f-a566-bf8c9c884ff1	ООО Рога и копыта	7736207543
d8969d91-b48d-4494-91d3-44e097330172	ООО	7736207543
4c52fe30-8e82-4bbf-b393-2333cad23886	ИП Коростелева	590400923413
15a95901-c239-4580-8629-fc1bbda66fe3	ООО "Випакс+"	5902140005
2b479eee-86c6-49f3-a7a8-58bf21475d7c	АО "ЭР-телеком"	5902202276
\.


--
-- Data for Name: archive_depth; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.archive_depth (id, depth) FROM stdin;
1c92dca3-3520-4950-98ec-a1a88b2ae539	1
6f41d9d7-d93d-4e88-ae26-2efef9fd0694	3
61b26e59-f1fe-4960-ad80-f33028e32935	6
bb4a5f44-4646-470d-80e4-71f2ccabe9b4	12
\.


--
-- Data for Name: city; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.city (id, name) FROM stdin;
eb03d433-299d-4311-b141-0d5c8cb1acd3	Алтайский край
70f1b83b-7c2d-4249-bc8c-5620c760c085	Амурская область
669f2a61-eb30-4b79-bb89-a98265b61a04	Архангельская область
d82abdb3-c80c-4aae-9494-170129c8134e	Астраханская область
c8be80ba-894a-4ed9-a8c1-fd7db0e78920	Белгородская область
bfa921a9-9a3d-49fb-bdda-65f53011f66f	Брянская область
d963d588-c179-4e43-95e7-2ffc0fc06856	Владимирская область
6c7c1621-2e71-40aa-9991-cfc782029e38	Волгоградская область
dcc8bcc7-f9c7-45d8-be85-377738563862	Вологодская область
0c493600-600b-4714-b2bd-340908f7b5f0	Воронежская область
ee831c69-7a0e-4062-af84-19b5c80f0b60	Москва и МО
2de58f0a-23c8-4463-9690-12e87917a2a3	Еврейская автономная область
f1327c41-378a-4af3-8b32-01a865103c01	Забайкальский край
bdeb7c0f-62ca-4ff0-946d-1e935e7dbdf7	Ивановская область
9347e1da-d115-466d-86ec-f0f189ba71b8	Иркутская область
a915e085-f1e8-48ec-8da3-d030d99f32ae	Кабардино-Балкарская Республика
9193b251-6f8a-45c8-9d61-ec0c776c6492	Калининградская область
001b02d6-a4f2-41ba-b9e1-ad0253d44575	Калужская область
f2a41d7d-0bcf-46b5-98e0-f7c890dbfa85	Камчатский край
fdd330d6-4cb5-4fcc-b22f-058f03478fd6	Карачаево-Черкесская Республика
d1cebf71-557c-443d-86a1-c8c6af31775c	Кировская область
bf136887-48a8-41f2-ac2b-00e1c69230a0	Костромская область
18b40b92-be05-4139-a44d-ca58ebef8f7a	Краснодарский край
7af38886-4b82-4c7c-9cd2-fa9389d82a42	Красноярский край
597c1166-6f09-4cdf-b670-121ce4a950f1	Курганская область
23403359-9a1f-4b49-bf11-1f208787dcc2	Курская область
dffa4c50-4718-4056-9d4d-e28df291d3e7	Ленинградская область
07d4139b-a0b0-49da-afaf-9248bb1448da	Липецкая область
17052543-7839-44d4-a944-26d8eb5bff3f	Магаданская область
b091cc8f-47a0-4b1c-85bc-70ccca145549	Мурманская область
91934d5f-6f76-4908-8a03-f06c9eac581c	Ненецкий автономный округ
9e9651c8-d149-48e3-8620-1cb4d8da56e3	Нижегородская область
f43dd428-6c16-45f2-b181-e04793120fcc	Новгородская область
c2dcd87f-bbd8-4538-a43a-50104ab4ebff	Новосибирская область
acde97f4-9467-4798-b961-8e248b18eaff	Омская область
6813b4c5-5034-4586-a639-67ab354c9e24	Оренбургская область
d1b0029c-b76f-476f-b368-db523db72c4e	Орловская область
e96a52d6-5e43-48eb-aace-7ae9f66a22f6	Пензенская область
7a4e2cd1-4c42-47a1-807e-3823c9199308	Пермский край
84e55e28-36e8-4341-93c0-27e0932191c5	Приморский край
63cd5c3f-eda3-42ea-b294-5692dbc6785f	Псковская область
be940aed-69c5-4194-9056-6fffc174a573	Республика Адыгея (Адыгея)
a071a144-8514-43b1-97a3-716f2b530683	Республика Алтай
d9958cc4-4741-492e-b9a8-b91b0004e453	Республика Башкортостан
67b9640a-0044-4f8c-b7b3-af7f84b81fcf	Республика Бурятия
4595487d-4eb7-4206-a0a6-4f117d88333b	Республика Дагестан
c75d0b93-9317-4706-a7b8-6b2c781c1036	Республика Ингушетия
70ba05f4-14b7-4b31-af34-70cca744cea6	Республика Калмыкия
88cf2466-9998-4e3e-8674-ce01b13e9a49	Республика Карелия
b2a224d0-2978-446f-bd69-fc15ac341550	Республика Коми
3c9327ed-e788-4510-8894-691a0035607f	Республика Крым
32e36d57-5b90-435e-b724-ef28e961251d	Республика Марий Эл
85145b61-670a-4667-91cb-b98f5f2f81bc	Республика Мордовия
9ed43488-6061-409d-85a1-72dff5586be3	Республика Саха (Якутия)
6fd6f6b3-42af-46f1-a629-4d7a1f113aac	Республика Северная Осетия - Алания
865f26c5-88c4-4e58-a19e-6369ab683541	Республика Татарстан (Татарстан)
ed7ff004-0e7e-4d40-9a28-6c86cd4c610d	Республика Тыва
eb07c573-3d6d-4020-b6ed-378b0c4707fb	Республика Хакасия
ee8ffa91-512b-49ac-b24b-f2e356e47907	Ростовская область
f6d25cd4-34ae-4e19-a3fb-8eabfddf6ac4	Рязанская область
477384f2-58c7-4231-9dc7-0d695913c85d	Самарская область
7b649370-6d2a-4df9-9494-ea1fe3b59e27	Санкт-Петербург
feac0deb-7df4-4f78-9e02-dc21c95cf50d	Саратовская область
e47d2e19-f573-45cf-8f73-109b89dcfc16	Сахалинская область
560ba5d1-88e9-4efe-aa29-6b49b3d9da96	Свердловская область
094e441a-c205-4a40-bff5-848295d3caa6	Севастополь
91147c0b-198a-434f-98b8-e850f8b97a54	Смоленская область
436f99c5-d836-4d07-aeab-3db3c421e5d4	Ставропольский край
d1d09f20-c21e-4c06-8f83-c491c830c071	Тамбовская область
18f7f215-e546-434d-9f44-d20ec0a786c7	Тверская область
b54de532-9b36-4e29-9b04-fa06eba0f9a9	Томская область
f05c04a3-3fa6-4c8b-a276-50355d598439	Тульская область
da478f46-e5e0-4ed6-b2b2-e243582b7889	Тюменская область
3cefb9d9-aa87-457f-ad1b-b6c78bc93fcf	Удмуртская Республика
42c21c64-49a1-4ed9-98bc-21396072a14c	Ульяновская область
7337cf27-5368-4ccb-ba67-a64d9c8fa0d2	Хабаровский край
4411d4a9-9623-42a9-b632-8bcf1dcaded1	Ханты-Мансийский автономный округ - Югра
64755d35-0f52-4a77-a9f4-29b4f78850b9	Челябинская область
6487ca22-b224-4ae4-8b41-fb0bd3b0c493	Чеченская Республика
e1484f6b-025b-497d-91dc-1bdb056815b1	Чувашская Республика - Чувашия
01c08f1d-8e08-43e6-be08-3994e4e029fe	Чукотский автономный округ
38ed3d71-3e2b-41dd-a16f-4ad1c5565033	Ямало-Ненецкий автономный округ
6115d098-113c-4907-b9c4-814fced41296	Ярославская область
b83ee587-799d-4e3f-81c0-5c09aa0a5163	Кемеровская область - Кузбасс
be92ca80-e54a-41d9-8492-7e68d1acad51	Иные территории, включая город и космодром Байконур
\.


--
-- Data for Name: competitor_solution; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.competitor_solution (id, is_from_competitor) FROM stdin;
a32e4b79-89fd-4274-9d21-ec47ccd52796	t
b4f27b39-a39a-4bfb-953b-30e34be9d12d	f
\.


--
-- Data for Name: discount_education; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.discount_education (id, is_discount) FROM stdin;
7b8594e2-8adf-4f8e-ba35-663d057e50b6	t
7e20258a-ecb1-4f15-9f72-efa7c4e95a90	f
\.


--
-- Data for Name: individual_discount_perpetual_license; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.individual_discount_perpetual_license (id, is_discount) FROM stdin;
2ccc48d6-fea8-4ced-9d37-225b84b30930	t
fa4a71f7-d381-4c1e-a6c0-b21e1af2708b	f
\.


--
-- Data for Name: individual_price_perpetual_license; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.individual_price_perpetual_license (id, is_individual_price) FROM stdin;
bfb00fb0-16ac-4508-a939-f92745679073	t
448e4243-aa80-4876-be85-3551f5aa548e	f
\.


--
-- Data for Name: license_order; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.license_order (id, type) FROM stdin;
268aaf7c-050d-4cb6-96f3-862d2fd4dbf9	Покупка новой лицензии
4f699d12-90c7-4923-aaee-3b614a4efa58	Продление существующей лицензии
\.


--
-- Data for Name: license_renewal; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.license_renewal (id, type) FROM stdin;
e0677942-df55-4334-bea0-9ac5565f4917	Продление до срока окончания лицензии
b98e879e-b260-466a-bd42-2b81942c9623	Продление после окончания срока лицензии
\.


--
-- Data for Name: license_term; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.license_term (id, type) FROM stdin;
c2e793ce-616f-4eec-9baf-9eda8245a257	3
54a86693-4617-41be-a19f-273f0a7d7ed5	12
8bc92994-9e62-4bef-a599-47d10d5181db	бессрочно
\.


--
-- Data for Name: order_change_type; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.order_change_type (id, type) FROM stdin;
7a606def-ff28-4d17-97ac-f5c46bc8aa33	Покупка новой лицензии
0bb10b34-1d2a-4d62-bf54-9b1dd9abdb9e	Увеличение количества пользователей
24dbca0f-bec4-449e-a3a3-f7057d16fce2	Продление существующих лицензий
\.


--
-- Data for Name: order_terms; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.order_terms (id, term) FROM stdin;
ace52aad-d47b-4ae7-9a8c-cb68519a7fd8	1 год
\.


--
-- Data for Name: premium_subscribe; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.premium_subscribe (id, type) FROM stdin;
b9d5e6a8-ff06-47a8-9fb7-89538340f6ba	Вкл
421b05e0-4a5e-4cbf-a8dc-32138e144299	Выкл
\.


--
-- Data for Name: support_premium; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.support_premium (id, is_need) FROM stdin;
307d986e-d0cb-42fd-8512-1e73eeb7f7e0	t
991008e9-974a-4620-8231-a20ea9411c15	f
\.


--
-- Data for Name: support_renewal; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.support_renewal (id, type) FROM stdin;
e027e07a-2dcb-4fe1-b7cb-1c5a9abeb8f0	Продление до срока окончания технической поддержки
36008b76-cf08-4ec9-9ada-f6b11b8b6b88	Продление после окончания срока технической поддержки
\.


--
-- Data for Name: support_renewal_period; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.support_renewal_period (id, period) FROM stdin;
e238d17c-1aff-4ec1-9996-371b52fdf85e	1 год
\.


--
-- Data for Name: support_technical; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.support_technical (id, type) FROM stdin;
20e1f4f2-2644-42c4-9aea-6e6e9b803d64	Да
bd9aafb6-5016-496a-ab7e-6fa2b41f0a97	Нет
\.


--
-- Data for Name: type_provision; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.type_provision (id, name) FROM stdin;
47085981-c763-4779-aade-68a0aa52f564	Облачное решение
019faae8-cc72-4ceb-a3fe-7e2b46297eb8	Лицензии
\.


--
-- Data for Name: type_storage_service; Type: TABLE DATA; Schema: info; Owner: postgres
--

COPY info.type_storage_service (id, name, type) FROM stdin;
6be4d99c-1296-4f3c-ad50-bc8c6b6a29d0	Оба варианта	{hdd,ssd}
56d8fa09-6670-4335-98a3-67344bdac8ec	HDD	{hdd}
a1d5e0ca-df62-42bc-a537-d93da2962247	SSD	{ssd}
\.


--
-- Data for Name: license_config; Type: TABLE DATA; Schema: info_price; Owner: postgres
--

COPY info_price.license_config (id, name, bandwidth_channel, license_range_id, vcpu, ram, hdd_capacity, ssd_capacity, coefficient_rate_appeal_to_support, number, cost_license) FROM stdin;
a65ffe48-9eb1-4d8d-9405-60385a4e4b8b	Конфигурация 2	4.44	b23b3ca4-7a54-477e-b690-84d74fe48cec	4	8	300	300	1.1	2	190.00
ebf20a60-bbbf-4419-a99f-4b8641912b75	Конфигурация 6	13.33	c62b36df-4de4-4afd-a106-1dc636ff1fac	10	20	900	900	1.25	6	150.00
b64182b9-541d-46b8-b3c3-345d8db71d98	Конфигурация 8	17.78	9de91956-be21-41e5-ba0a-761aa0f7448c	16	32	1100	1100	1.25	8	130.00
d6dbd1df-b4d0-448f-9c84-79777b768d26	Конфигурация 9	20	ddc9797f-c6e0-4e7b-a904-cd151421c0d7	18	36	1300	1300	1.25	9	120.00
617f646d-94d8-4054-b7e8-bdfa1335e026	Конфигурация 5	10.91	385e34ce-2ece-42df-9e28-6159c5231316	8	18	700	700	1.25	5	160.00
cc0b0c7d-b076-4121-bdbb-44c7da7382d2	Конфигурация 10	22.22	9866d21b-456f-4a25-a9cc-6f290e5e9ae4	24	38	1500	1500	1.5	10	110.00
0a88f443-fced-4478-bcbc-df4a9f3f85a8	Конфигурация 3	6.67	d0595c8b-7b0f-46cf-8452-060d57925d51	6	12	500	500	1.1	3	180.00
6454151f-2e0d-4f78-ade6-34b52c79405e	Конфигурация 1	2.22	21f39b14-3ec3-4c2c-bbdc-1e7efcca4675	4	6	100	100	1	1	200.00
544a680a-d30f-48c5-b5cd-6bed3c25cffa	Конфигурация 7	15.56	e786caf4-24f7-428e-b035-0528dca11156	14	24	950	950	1.25	7	140.00
db1dced0-e89b-48e5-976b-47777645e85f	Конфигурация 4	8.89	cff3590e-8874-4c6a-b34c-dd226ee85aeb	8	16	600	600	1.25	4	170.00
\.


--
-- Data for Name: license_range; Type: TABLE DATA; Schema: info_price; Owner: postgres
--

COPY info_price.license_range (id, user_from, user_to) FROM stdin;
21f39b14-3ec3-4c2c-bbdc-1e7efcca4675	1	25
b23b3ca4-7a54-477e-b690-84d74fe48cec	26	50
d0595c8b-7b0f-46cf-8452-060d57925d51	51	75
cff3590e-8874-4c6a-b34c-dd226ee85aeb	76	100
385e34ce-2ece-42df-9e28-6159c5231316	101	125
c62b36df-4de4-4afd-a106-1dc636ff1fac	126	150
e786caf4-24f7-428e-b035-0528dca11156	151	175
9de91956-be21-41e5-ba0a-761aa0f7448c	176	200
ddc9797f-c6e0-4e7b-a904-cd151421c0d7	201	225
9866d21b-456f-4a25-a9cc-6f290e5e9ae4	226	250
\.


--
-- Data for Name: unit_cost; Type: TABLE DATA; Schema: info_price; Owner: postgres
--

COPY info_price.unit_cost (id, name, value, unit_measure, description) FROM stdin;
cost_network_erth_magistral	Стоимость сетевых ресурсов ЭРТХ (магистральная сеть)	45	руб/мбит	\N
support_count_request	Количество обращений на линии техподдержки ТП-1, ТП-2	5	шт/мес	\N
support_duration_solve	Длительность решения 1 обращения ТП-1, ТП-2	30	минут	\N
support_cost	Стоимость ресурса ТП-1, ТП-2	68500	руб/мес	с налогами
duty_engineer_duration_solve	Длительность решения 1 обращения ДИ	30	минут	\N
cost_operation_resource	Стоимость ресурса эксплуатации	100000	руб/мес	с налогами
work_minutes_per_month	Нормативное кол-во рабочего времени в месяц	10560	минут	8 часов смена
marginality_erth	Маржинальность ЭРТХ	0.5	%	\N
marginality_partner_product	Маржинальность партнерского продукта	0.5	%	\N
cost_vcpu_per_core	vCPU (1 ядро)	680	руб/vCPU	\N
cost_ram_per_gb	RAM (1 Гбайт)	254	руб/Gb	\N
cost_hdd_per_gb	HDD (1 Гбайт)	3.5	руб/Gb	\N
cost_ssd_per_gb	SSD (1 Гбайт)	51	руб/Gb	\N
cost_full_control	Полный контроль + контроль экрана на 1 агент  = 250 килобит/c	0.031	мбит/c	\N
duty_engineer_cost	Стоимость ресурса ДИ	90000	руб/мес	с налогами
duty_engineer_count_request	Количество обращений на дежурных инженеров (ДИ)	0.5	шт/мес	\N
deploy_duration	Длительность технического развертывания, обслуживания инфраструктуры	60	минут	\N
offer_until_date	Срок длительности предложения	14	дней	\N
\.


--
-- Name: client client_pk; Type: CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.client
    ADD CONSTRAINT client_pk PRIMARY KEY (id);


--
-- Name: calc order_pk; Type: CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT order_pk PRIMARY KEY (id);


--
-- Name: archive_depth archive_depth_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.archive_depth
    ADD CONSTRAINT archive_depth_pk PRIMARY KEY (id);


--
-- Name: city city_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.city
    ADD CONSTRAINT city_pk PRIMARY KEY (id);


--
-- Name: competitor_solution competitor_solution_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.competitor_solution
    ADD CONSTRAINT competitor_solution_pk PRIMARY KEY (id);


--
-- Name: discount_education discount_education_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.discount_education
    ADD CONSTRAINT discount_education_pk PRIMARY KEY (id);


--
-- Name: individual_discount_perpetual_license discount_perpetual_license_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.individual_discount_perpetual_license
    ADD CONSTRAINT discount_perpetual_license_pk PRIMARY KEY (id);


--
-- Name: individual_price_perpetual_license individual_perpetual_price_license_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.individual_price_perpetual_license
    ADD CONSTRAINT individual_perpetual_price_license_pk PRIMARY KEY (id);


--
-- Name: license_order license_order_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.license_order
    ADD CONSTRAINT license_order_pk PRIMARY KEY (id);


--
-- Name: license_renewal license_renewal_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.license_renewal
    ADD CONSTRAINT license_renewal_pk PRIMARY KEY (id);


--
-- Name: license_term license_term_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.license_term
    ADD CONSTRAINT license_term_pk PRIMARY KEY (id);


--
-- Name: order_change_type order_change_type_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.order_change_type
    ADD CONSTRAINT order_change_type_pk PRIMARY KEY (id);


--
-- Name: order_terms order_terms_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.order_terms
    ADD CONSTRAINT order_terms_pk PRIMARY KEY (id);


--
-- Name: premium_subscribe premium_subscribe_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.premium_subscribe
    ADD CONSTRAINT premium_subscribe_pk PRIMARY KEY (id);


--
-- Name: type_storage_service service_type_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.type_storage_service
    ADD CONSTRAINT service_type_pk PRIMARY KEY (id);


--
-- Name: support_premium support_premium_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.support_premium
    ADD CONSTRAINT support_premium_pk PRIMARY KEY (id);


--
-- Name: support_renewal_period support_renewal_period_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.support_renewal_period
    ADD CONSTRAINT support_renewal_period_pk PRIMARY KEY (id);


--
-- Name: support_renewal support_renewal_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.support_renewal
    ADD CONSTRAINT support_renewal_pk PRIMARY KEY (id);


--
-- Name: support_technical support_technical_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.support_technical
    ADD CONSTRAINT support_technical_pk PRIMARY KEY (id);


--
-- Name: type_provision type_provision_pk; Type: CONSTRAINT; Schema: info; Owner: postgres
--

ALTER TABLE ONLY info.type_provision
    ADD CONSTRAINT type_provision_pk PRIMARY KEY (id);


--
-- Name: license_config license_config_pk; Type: CONSTRAINT; Schema: info_price; Owner: postgres
--

ALTER TABLE ONLY info_price.license_config
    ADD CONSTRAINT license_config_pk PRIMARY KEY (id);


--
-- Name: license_range license_range_pk; Type: CONSTRAINT; Schema: info_price; Owner: postgres
--

ALTER TABLE ONLY info_price.license_range
    ADD CONSTRAINT license_range_pk PRIMARY KEY (id);


--
-- Name: unit_cost unit_cost_pk; Type: CONSTRAINT; Schema: info_price; Owner: postgres
--

ALTER TABLE ONLY info_price.unit_cost
    ADD CONSTRAINT unit_cost_pk PRIMARY KEY (id);


--
-- Name: order_create_at_index; Type: INDEX; Schema: history; Owner: postgres
--

CREATE INDEX order_create_at_index ON history.calc USING btree (create_at DESC);


--
-- Name: archive_depth_depth_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX archive_depth_depth_uindex ON info.archive_depth USING btree (depth);


--
-- Name: city_name_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX city_name_uindex ON info.city USING btree (name);


--
-- Name: competitor_solution_is_from_competitor_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX competitor_solution_is_from_competitor_uindex ON info.competitor_solution USING btree (is_from_competitor);


--
-- Name: discount_education_is_discount_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX discount_education_is_discount_uindex ON info.discount_education USING btree (is_discount);


--
-- Name: individual_perpetual_price_license_is_individual_price_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX individual_perpetual_price_license_is_individual_price_uindex ON info.individual_price_perpetual_license USING btree (is_individual_price);


--
-- Name: license_order_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX license_order_type_uindex ON info.license_order USING btree (type);


--
-- Name: license_renewal_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX license_renewal_type_uindex ON info.license_renewal USING btree (type);


--
-- Name: license_term_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX license_term_type_uindex ON info.license_term USING btree (type);


--
-- Name: order_change_type_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX order_change_type_type_uindex ON info.order_change_type USING btree (type);


--
-- Name: order_terms_term_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX order_terms_term_uindex ON info.order_terms USING btree (term);


--
-- Name: premium_subscribe_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX premium_subscribe_type_uindex ON info.premium_subscribe USING btree (type);


--
-- Name: support_premium_is_need_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX support_premium_is_need_uindex ON info.support_premium USING btree (is_need);


--
-- Name: support_renewal_period_period_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX support_renewal_period_period_uindex ON info.support_renewal_period USING btree (period);


--
-- Name: support_renewal_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX support_renewal_type_uindex ON info.support_renewal USING btree (type);


--
-- Name: support_technical_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX support_technical_type_uindex ON info.support_technical USING btree (type);


--
-- Name: type_provision_name_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX type_provision_name_uindex ON info.type_provision USING btree (name);


--
-- Name: type_storage_service_type_uindex; Type: INDEX; Schema: info; Owner: postgres
--

CREATE UNIQUE INDEX type_storage_service_type_uindex ON info.type_storage_service USING btree (type);


--
-- Name: license_config_number_uindex; Type: INDEX; Schema: info_price; Owner: postgres
--

CREATE UNIQUE INDEX license_config_number_uindex ON info_price.license_config USING btree (number);


--
-- Name: license_range_user_from_user_to_uindex; Type: INDEX; Schema: info_price; Owner: postgres
--

CREATE UNIQUE INDEX license_range_user_from_user_to_uindex ON info_price.license_range USING btree (user_from, user_to);


--
-- Name: calc calc_client_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT calc_client_id_fk FOREIGN KEY (client_id) REFERENCES history.client(id);


--
-- Name: calc calc_license_config_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT calc_license_config_id_fk FOREIGN KEY (license_config_id) REFERENCES info_price.license_config(id);


--
-- Name: calc order_archive_depth_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT order_archive_depth_id_fk FOREIGN KEY (archive_depth_id) REFERENCES info.archive_depth(id);


--
-- Name: calc order_city_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT order_city_id_fk FOREIGN KEY (city_id) REFERENCES info.city(id);


--
-- Name: calc order_type_provision_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT order_type_provision_id_fk FOREIGN KEY (type_provision_id) REFERENCES info.type_provision(id);


--
-- Name: calc order_type_storage_service_id_fk; Type: FK CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.calc
    ADD CONSTRAINT order_type_storage_service_id_fk FOREIGN KEY (type_storage_id) REFERENCES info.type_storage_service(id);


--
-- PostgreSQL database dump complete
--

