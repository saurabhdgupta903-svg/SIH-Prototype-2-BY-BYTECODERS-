import asyncio
import random
from datetime import datetime, date, timedelta
from sqlalchemy import select
from ..database import engine, Base, AsyncSessionLocal
from ..models import (
    User, UserRole, Institution, InstitutionType, Kitchen, ProcessingUnit,
    Receiver, ReceiverType, Vehicle, FoodItem, Recipe, Inventory,
    ProductionRecord, ConsumptionRecord, WasteRecord, WasteReason,
    SurplusRecord, SurplusStatus, RecoveryPath, QualityCheck, QualityRiskCategory,
    Machine, MachineStatus, MachineEvent, SensorReading,
    Alert, AlertSeverity, ImpactMetric, EmissionFactor
)
from ..utils.security import get_password_hash
from ..ml.demand_forecaster import demand_forecaster

async def seed_database():
    """Seeds the database with 12 months of synthetic data and demo entities."""
    # Ensure all tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    try:
        async with AsyncSessionLocal() as session:
            # Check if already seeded
            q = await session.execute(select(User).limit(1))
            if q.scalars().first():
                print("Database already contains seeded data. Skipping re-seed.")
                return

            print("Seeding FoodLoop database with institutions, users, and 12-month historical data...")

        # 1. Emission Factors with mandatory Source Citations
        factors = [
            EmissionFactor(
                commodity_or_resource="Cooked Meals (General Average)",
                emission_factor_kg_co2e=2.50,
                unit="kg CO2e / kg food",
                source_citation="IPCC AR6 / WRAP UK Food Waste Benchmark 2021",
                assumptions="Weighted average across cooked rice, vegetables, pulses; includes upstream agriculture and landfill methane avoidance"
            ),
            EmissionFactor(
                commodity_or_resource="Cooked Rice",
                emission_factor_kg_co2e=3.80,
                unit="kg CO2e / kg",
                source_citation="FAO Food Wastage Footprint: Impacts on Natural Resources 2019",
                assumptions="Includes agricultural paddy methane emissions and cooking energy"
            ),
            EmissionFactor(
                commodity_or_resource="Vegetable Curry / Mix Vegetables",
                emission_factor_kg_co2e=1.60,
                unit="kg CO2e / kg",
                source_citation="WRAP Hospitality and Food Service Sector Guidance 2021",
                assumptions="Farm gate to plate life cycle"
            ),
            EmissionFactor(
                commodity_or_resource="Dal / Pulses",
                emission_factor_kg_co2e=1.90,
                unit="kg CO2e / kg",
                source_citation="Poore & Nemecek, Science (2018) via IPCC Refinement",
                assumptions="Low carbon nitrogen-fixing pulse lifecycle"
            ),
            EmissionFactor(
                commodity_or_resource="Indian Electricity Grid Baseline",
                emission_factor_kg_co2e=0.716,
                unit="kg CO2e / kWh",
                source_citation="Central Electricity Authority (CEA) CO2 Baseline Database v19, Ministry of Power",
                assumptions="Combined margin grid emission factor for National Grid"
            ),
            EmissionFactor(
                commodity_or_resource="Freshwater Consumption in Food Prep",
                emission_factor_kg_co2e=0.001,
                unit="kg CO2e / Litre",
                source_citation="FAO Aquastat & Water Footprint Network 2020",
                assumptions="Average 1000 Litres blue+green water embedded per kg of food"
            )
        ]
        session.add_all(factors)

        # 2. Demo Institution
        inst = Institution(
            name="Sahyadri Educational & Institutional Complex",
            institution_type=InstitutionType.COLLEGE,
            address="Senapati Bapat Road, Shivajinagar, Pune, Maharashtra 411016",
            city="Pune",
            state="Maharashtra",
            latitude=18.5204,
            longitude=73.8567,
            daily_headcount=850,
            operating_hours="06:00-22:30",
            cold_storage_capacity_kg=800.0,
            dry_storage_capacity_kg=4000.0,
            is_verified=True
        )
        session.add(inst)
        await session.flush()

        # 3. Kitchen & Processing Unit
        kitchen = Kitchen(
            institution_id=inst.id,
            name="Sahyadri Central Mega Kitchen",
            meal_capacity_per_shift=1200,
            shifts=["breakfast", "lunch", "dinner"],
            is_active=True
        )
        fpu = ProcessingUnit(
            institution_id=inst.id,
            name="Sahyadri Agro & Grain Pre-Processing Unit",
            category="Grains, Flours, and Fresh Cut Produce Pre-Processing",
            processing_capacity_kg_per_day=4500.0,
            baseline_energy_kwh_per_tonne=82.5,
            baseline_loss_percentage=4.2
        )
        session.add_all([kitchen, fpu])
        await session.flush()

        # 4. Receivers (NGOs, Shelters, Community Kitchens, Organic Recycler)
        r1 = Receiver(
            name="Annapoorna Community Kitchen Pune",
            receiver_type=ReceiverType.COMMUNITY_KITCHEN,
            address="Near Modern High School, Shivajinagar, Pune 411005",
            city="Pune",
            state="Maharashtra",
            latitude=18.5314,
            longitude=73.8446,
            contact_person="Sunita Patil",
            contact_phone="+91 98220 12345",
            operating_hours="07:00-21:30",
            capacity_meals=350,
            has_cold_storage=True,
            accepted_food_types=["cooked_meals", "raw_produce"],
            is_verified=True,
            source="manual",
            priority_level=2
        )
        r2 = Receiver(
            name="Seva Sadan Shelter & Relief Trust",
            receiver_type=ReceiverType.SHELTER,
            address="Sadashiv Peth, Pune 411030",
            city="Pune",
            state="Maharashtra",
            latitude=18.5122,
            longitude=73.8519,
            contact_person="Ramesh Deshmukh",
            contact_phone="+91 94220 54321",
            operating_hours="08:00-22:00",
            capacity_meals=200,
            has_cold_storage=False,
            accepted_food_types=["cooked_meals", "packaged"],
            is_verified=True,
            source="manual",
            priority_level=2
        )
        r3 = Receiver(
            name="Roti Bank Maharashtra - Kothrud Node",
            receiver_type=ReceiverType.FOOD_BANK,
            address="Paud Road, Kothrud, Pune 411038",
            city="Pune",
            state="Maharashtra",
            latitude=18.5074,
            longitude=73.8077,
            contact_person="Anil Kulkarni",
            contact_phone="+91 98901 88776",
            operating_hours="09:00-21:00",
            capacity_meals=500,
            has_cold_storage=True,
            accepted_food_types=["cooked_meals", "raw_produce", "packaged"],
            is_verified=True,
            source="manual",
            priority_level=1
        )
        r4 = Receiver(
            name="Aashray Homeless Care Shelter",
            receiver_type=ReceiverType.SHELTER,
            address="Hadapsar Industrial Corridor, Pune 411028",
            city="Pune",
            state="Maharashtra",
            latitude=18.4967,
            longitude=73.9417,
            contact_person="Sister Teresa Rao",
            contact_phone="+91 97654 33221",
            operating_hours="10:00-20:00",
            capacity_meals=150,
            has_cold_storage=False,
            accepted_food_types=["cooked_meals"],
            is_verified=True,
            source="manual",
            priority_level=2
        )
        r5 = Receiver(
            name="MahaBio Municipal Organic Composter",
            receiver_type=ReceiverType.ORGANIC_RECYCLER,
            address="Uruli Devachi Buffer Zone, Pune 412308",
            city="Pune",
            state="Maharashtra",
            latitude=18.4612,
            longitude=73.9628,
            contact_person="Dr. Vikas Joshi",
            contact_phone="+91 98811 77654",
            operating_hours="06:00-18:00",
            capacity_meals=2500,
            has_cold_storage=False,
            accepted_food_types=["cooked_meals", "raw_produce", "preparation_waste"],
            is_verified=True,
            source="manual",
            priority_level=1
        )
        r6 = Receiver(
            name="Kisan Cattle Shelter Feed Depot",
            receiver_type=ReceiverType.ANIMAL_FEED_SHELTER,
            address="Manjari Agricultural Zone, Pune 412307",
            city="Pune",
            state="Maharashtra",
            latitude=18.5245,
            longitude=73.9812,
            contact_person="Gopal Shinde",
            contact_phone="+91 99220 99881",
            operating_hours="07:00-19:00",
            capacity_meals=1000,
            has_cold_storage=False,
            accepted_food_types=["raw_produce", "grains"],
            is_verified=True,
            source="manual",
            priority_level=1
        )
        # Receiver imported from OSM Overpass with unverified status (to demo admin verification workflow)
        r_osm = Receiver(
            name="Viman Nagar Community Welfare Centre (OSM Node)",
            receiver_type=ReceiverType.COMMUNITY_KITCHEN,
            address="Symbiosis Rd, Viman Nagar, Pune 411014",
            city="Pune",
            state="Maharashtra",
            latitude=18.5679,
            longitude=73.9143,
            contact_person="Local Ward Representative",
            contact_phone="+91 20 2663 1122",
            operating_hours="08:00-20:00",
            capacity_meals=200,
            has_cold_storage=False,
            accepted_food_types=["cooked_meals"],
            is_verified=False, # Demonstrates admin verification workflow
            source="osm_overpass",
            priority_level=1
        )
        session.add_all([r1, r2, r3, r4, r5, r6, r_osm])
        await session.flush()

        # 5. Vehicle
        veh = Vehicle(
            institution_id=inst.id,
            vehicle_number="MH-12-FL-2026",
            vehicle_type="Insulated Electric Van",
            capacity_kg=350.0,
            has_insulated_box=True,
            driver_name="Rajesh Jadhav",
            driver_phone="+91 98230 44556",
            is_available=True
        )
        session.add(veh)

        # 6. Users (All 6 Roles with secure passwords)
        users = [
            User(
                email="admin@foodloop.gov.in",
                hashed_password=get_password_hash("admin123"),
                full_name="Dr. Arvind Sharma (Joint Director, MoFPI)",
                role=UserRole.ADMIN,
                institution_id=inst.id
            ),
            User(
                email="kitchen@foodloop.gov.in",
                hashed_password=get_password_hash("kitchen123"),
                full_name="Chef Manoj Kulkarni (Executive Chef & Canteen Head)",
                role=UserRole.KITCHEN_MANAGER,
                institution_id=inst.id
            ),
            User(
                email="fpu@foodloop.gov.in",
                hashed_password=get_password_hash("fpu123"),
                full_name="Pooja Shinde (Operations Lead, Pre-Processing)",
                role=UserRole.FPU_MANAGER,
                institution_id=inst.id
            ),
            User(
                email="receiver@foodloop.gov.in",
                hashed_password=get_password_hash("receiver123"),
                full_name="Sunita Patil (Director, Annapoorna Community Kitchen)",
                role=UserRole.RECEIVER,
                receiver_id=r1.id
            ),
            User(
                email="driver@foodloop.gov.in",
                hashed_password=get_password_hash("driver123"),
                full_name="Rajesh Jadhav (Redistribution Logistics Driver)",
                role=UserRole.DRIVER,
                institution_id=inst.id
            ),
            User(
                email="reviewer@foodloop.gov.in",
                hashed_password=get_password_hash("reviewer123"),
                full_name="Kavita Deshmukh (State Food & Civil Supplies Auditor)",
                role=UserRole.REVIEWER
            )
        ]
        session.add_all(users)
        await session.flush()

        # 7. Food Items & Recipes
        f_rice = FoodItem(name="Cooked Basmati / Kolam Rice", category="Cooked Staples", unit="kg", shelf_life_hours=5, emission_factor_kg_co2_per_kg=3.8, cost_per_kg_inr=55.0, water_footprint_litres_per_kg=2500.0)
        f_veg = FoodItem(name="Mixed Seasonal Vegetable Curry", category="Vegetables", unit="kg", shelf_life_hours=4, emission_factor_kg_co2_per_kg=1.6, cost_per_kg_inr=70.0, water_footprint_litres_per_kg=350.0)
        f_chapati = FoodItem(name="Whole Wheat Chapati / Roti", category="Cooked Staples", unit="kg", shelf_life_hours=8, emission_factor_kg_co2_per_kg=1.4, cost_per_kg_inr=45.0, water_footprint_litres_per_kg=900.0)
        f_dal = FoodItem(name="Toor Dal Tadka", category="Pulses", unit="kg", shelf_life_hours=4, emission_factor_kg_co2_per_kg=1.9, cost_per_kg_inr=85.0, water_footprint_litres_per_kg=1200.0)
        f_curd = FoodItem(name="Fresh Chilled Curd", category="Dairy", unit="kg", shelf_life_hours=24, emission_factor_kg_co2_per_kg=4.2, cost_per_kg_inr=65.0, water_footprint_litres_per_kg=1800.0)
        food_items = [f_rice, f_veg, f_chapati, f_dal, f_curd]
        session.add_all(food_items)
        await session.flush()

        # 8. Inventory (Raw Commodities & Buffer)
        invs = [
            Inventory(kitchen_id=kitchen.id, food_item_id=f_rice.id, quantity_kg=180.0, min_threshold_kg=50.0, storage_type="dry", batch_number="RC-2026-B1"),
            Inventory(kitchen_id=kitchen.id, food_item_id=f_veg.id, quantity_kg=95.0, min_threshold_kg=30.0, storage_type="cold", batch_number="VG-2026-B4"),
            Inventory(kitchen_id=kitchen.id, food_item_id=f_chapati.id, quantity_kg=220.0, min_threshold_kg=60.0, storage_type="dry", batch_number="WH-2026-B2"),
            Inventory(kitchen_id=kitchen.id, food_item_id=f_dal.id, quantity_kg=110.0, min_threshold_kg=40.0, storage_type="dry", batch_number="DL-2026-B3"),
            Inventory(kitchen_id=kitchen.id, food_item_id=f_curd.id, quantity_kg=45.0, min_threshold_kg=15.0, storage_type="cold", batch_number="DY-2026-B7")
        ]
        session.add_all(invs)

        # 9. Machines in Food Processing Unit
        m1 = Machine(processing_unit_id=fpu.id, name="Primary Grain Cleaner & Sifter", machine_type="Rotary Drum Sifter", status=MachineStatus.RUNNING, current_efficiency_pct=95.2, rated_power_kw=15.0, current_power_draw_kw=14.1, operating_hours_today=7.2)
        m2 = Machine(processing_unit_id=fpu.id, name="High-Capacity Hammer Mill", machine_type="Grain Pulverizer", status=MachineStatus.RUNNING, current_efficiency_pct=92.8, rated_power_kw=25.0, current_power_draw_kw=23.4, operating_hours_today=6.8)
        m3 = Machine(processing_unit_id=fpu.id, name="Continuous Vegetable Washer & Slicer", machine_type="Produce Processing Line", status=MachineStatus.RUNNING, current_efficiency_pct=96.0, rated_power_kw=12.0, current_power_draw_kw=11.2, operating_hours_today=8.0)
        m4 = Machine(processing_unit_id=fpu.id, name="Cold Storage Compressor Unit 1", machine_type="Refrigeration Compressor", status=MachineStatus.REDUCED_EFFICIENCY, current_efficiency_pct=78.5, rated_power_kw=18.0, current_power_draw_kw=21.4, operating_hours_today=14.5)
        session.add_all([m1, m2, m3, m4])
        await session.flush()

        # Machine anomaly event for m4
        me = MachineEvent(
            machine_id=m4.id,
            event_type="reduced_efficiency",
            start_time=datetime.utcnow() - timedelta(hours=3),
            duration_minutes=180.0,
            reason="Thermal expansion valve cycling; power draw 18.8% above baseline",
            loss_estimate_kg=0.0
        )
        session.add(me)

        # 10. Sensor Readings (including Cold Room A temperature drift anomaly: 5C -> 8C -> 11C)
        now_dt = datetime.utcnow()
        sensors = [
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="temperature", reading_value=4.8, unit="C", is_anomaly=False, recorded_at=now_dt - timedelta(minutes=45)),
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="temperature", reading_value=5.4, unit="C", is_anomaly=False, recorded_at=now_dt - timedelta(minutes=30)),
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="temperature", reading_value=7.9, unit="C", is_anomaly=False, recorded_at=now_dt - timedelta(minutes=15)),
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="temperature", reading_value=11.2, unit="C", is_anomaly=True, anomaly_reason="Potential storage issue detected: temperature rose from 4.8°C to 11.2°C over 45 minutes", recorded_at=now_dt),
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="humidity", reading_value=84.0, unit="%", is_anomaly=False, recorded_at=now_dt),
            SensorReading(processing_unit_id=fpu.id, location="Cold Storage Room A", sensor_type="door_status", reading_value=0.0, unit="closed", is_anomaly=False, recorded_at=now_dt),
            SensorReading(processing_unit_id=fpu.id, location="Processing Floor", sensor_type="power_kw", reading_value=62.8, unit="kW", is_anomaly=False, recorded_at=now_dt)
        ]
        session.add_all(sensors)

        # 11. Generate 12 Months (365 Days) Realistic Synthetic Historical Data
        print("Generating 12 months (1095 meals) of synthetic consumption and waste records...")
        today = date.today()
        start_date = today - timedelta(days=365)
        current_date = start_date

        random.seed(42)
        consumption_rows = []
        production_rows = []
        waste_rows = []

        total_rescued_kg = 0.0
        total_prevented_kg = 0.0
        total_meals_rescued = 0

        # Known Indian holiday month/days
        holidays_set = {(1, 26), (3, 25), (4, 14), (5, 1), (8, 15), (9, 7), (10, 2), (10, 24), (11, 1), (11, 12), (12, 25)}
        exam_months = {3, 4, 11, 12}

        while current_date < today:
            dow = current_date.weekday()
            is_weekend = dow >= 5
            is_holiday = (current_date.month, current_date.day) in holidays_set
            is_exam = current_date.month in exam_months and (10 <= current_date.day <= 25)

            # Weather synthetic distribution (Pune climate: warm, heavy monsoon Jul-Aug)
            if current_date.month in [6, 7, 8]:
                precip = round(random.uniform(5.0, 35.0), 1) if random.random() < 0.65 else 0.0
                temp = round(random.uniform(22.0, 29.0), 1)
            elif current_date.month in [3, 4, 5]:
                precip = 0.0
                temp = round(random.uniform(31.0, 39.0), 1)
            else:
                precip = round(random.uniform(0.0, 5.0), 1) if random.random() < 0.15 else 0.0
                temp = round(random.uniform(24.0, 30.0), 1)

            # Campus attendance headcount
            base_headcount = 850
            if is_holiday:
                headcount = int(base_headcount * 0.45)
            elif is_weekend:
                headcount = int(base_headcount * 0.70)
            else:
                headcount = base_headcount + random.randint(-40, 40)

            for meal in ["breakfast", "lunch", "dinner"]:
                meal_factor = {"breakfast": 0.70, "lunch": 0.95, "dinner": 0.88}[meal]
                expected_demand = int(headcount * meal_factor)

                # Simulated noise
                actual_consumed = max(10, expected_demand + random.randint(-25, 25))
                # Planned production: early in year higher overproduction, improves with FoodLoop
                progress_factor = (current_date - start_date).days / 365.0
                overprod_margin = random.uniform(0.08, 0.16) * (1.0 - 0.45 * progress_factor)
                planned_portions = int(round(expected_demand * (1.0 + overprod_margin)))
                actual_produced = planned_portions

                consumed_kg = round(actual_consumed * 0.42, 2)
                planned_kg = round(planned_portions * 0.42, 2)
                surplus_portions = max(0, actual_produced - actual_consumed)
                surplus_kg = round(surplus_portions * 0.42, 2)

                # Historical waste recorded
                unrescued_waste_kg = round(surplus_kg * random.uniform(0.3, 0.6), 2)
                prevented_kg = round(planned_kg * overprod_margin * 0.4, 2)

                total_rescued_kg += (surplus_kg - unrescued_waste_kg)
                total_prevented_kg += prevented_kg
                total_meals_rescued += int(round((surplus_kg - unrescued_waste_kg) / 0.42))

                c_rec = ConsumptionRecord(
                    kitchen_id=kitchen.id,
                    record_date=current_date,
                    meal_type=meal,
                    food_item_id=f_rice.id,
                    headcount=headcount,
                    consumed_kg=consumed_kg,
                    consumed_portions=actual_consumed,
                    temperature_c=temp,
                    precipitation_mm=precip,
                    is_holiday=is_holiday,
                    is_exam_period=is_exam,
                    is_weekend=is_weekend
                )
                consumption_rows.append(c_rec)

                p_rec = ProductionRecord(
                    kitchen_id=kitchen.id,
                    record_date=current_date,
                    meal_type=meal,
                    food_item_id=f_rice.id,
                    planned_portions=planned_portions,
                    recommended_portions=int(expected_demand * 1.03),
                    actual_portions=actual_produced,
                    planned_kg=planned_kg,
                    actual_kg=planned_kg
                )
                production_rows.append(p_rec)

                # Random waste log entry every 2-3 days
                if unrescued_waste_kg > 5.0 and random.random() < 0.45:
                    reason = random.choice([
                        WasteReason.OVERPRODUCTION,
                        WasteReason.PREPARATION_WASTE,
                        WasteReason.PLATE_WASTE,
                        WasteReason.LOW_DEMAND
                    ])
                    w_rec = WasteRecord(
                        kitchen_id=kitchen.id,
                        food_item_id=random.choice(food_items).id,
                        quantity_kg=unrescued_waste_kg,
                        reason=reason,
                        notes=f"Post-meal log: {unrescued_waste_kg:.1f} kg surplus not cleared within 4h window",
                        recorded_at=datetime.combine(current_date, datetime.min.time()) + timedelta(hours=14)
                    )
                    waste_rows.append(w_rec)

            current_date += timedelta(days=1)

        # Batch insert historical records
        session.add_all(consumption_rows)
        session.add_all(production_rows)
        session.add_all(waste_rows)
        await session.flush()

        # 12. Create Demo Surplus for the 5-Minute Demo Flow
        # Scenario: 45 meals surplus of freshly prepared rice and dal mix
        demo_surplus = SurplusRecord(
            traceability_id="FL-2026-000182",
            kitchen_id=kitchen.id,
            food_item_id=f_rice.id,
            description="Cooked Basmati Rice and Toor Dal Combo (45 portions)",
            quantity_kg=19.5,
            estimated_portions=45,
            prepared_at=datetime.utcnow() - timedelta(hours=2, minutes=45),
            ready_time=datetime.utcnow() - timedelta(minutes=30),
            safe_pickup_window_start=datetime.utcnow(),
            safe_pickup_window_end=datetime.utcnow() + timedelta(hours=2, minutes=30),
            status=SurplusStatus.SCREENED,
            recommended_recovery_path=RecoveryPath.EDIBLE_DONATION,
            storage_temp_c=63.5, # Warm holding
            is_perishable=True
        )
        session.add(demo_surplus)
        await session.flush()

        # Quality Check for Demo Surplus: "Verification required"
        demo_qc = QualityCheck(
            surplus_id=demo_surplus.id,
            preparation_timestamp=demo_surplus.prepared_at,
            current_timestamp=datetime.utcnow(),
            holding_hours=2.8,
            storage_temperature_c=63.5,
            packaging_integrity="intact",
            rule_check_passed=True,
            rule_check_summary="Hot holding compliant (>60°C). Holding time 2.8 hours approaches 3h threshold.",
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            vision_risk_score=0.38,
            risk_category=QualityRiskCategory.VERIFICATION_REQUIRED,
            vision_assessment_notes="Surface steam and color consistency normal. Holding time requires supervisor verification sign-off.",
            approval_status="pending"
        )
        session.add(demo_qc)

        # Active Alerts for the Dashboard
        a1 = Alert(
            institution_id=inst.id,
            alert_type="surplus_predicted",
            severity=AlertSeverity.WARNING,
            title="Predicted Surplus Alert: Dinner Shift",
            message="Potential surplus of 28 to 45 meals expected between 08:00 and 09:30 PM. 3 standby receivers notified.",
            action_url="/kitchen/surplus"
        )
        a2 = Alert(
            institution_id=inst.id,
            alert_type="storage_anomaly",
            severity=AlertSeverity.CRITICAL,
            title="Cold Storage Room A Anomaly",
            message="Temperature rose from 4.8°C to 11.2°C over 45 minutes. Compressor degradation suspected.",
            action_url="/processing/storage"
        )
        a3 = Alert(
            institution_id=inst.id,
            alert_type="quality_verification",
            severity=AlertSeverity.WARNING,
            title="Quality Clearance Required",
            message="Traceability ID FL-2026-000182 (45 portions) awaiting supervisor release sign-off.",
            action_url="/kitchen/quality"
        )
        session.add_all([a1, a2, a3])

        # 13. Sustainability Impact Metric Summary
        co2e_avoided = round(total_rescued_kg * 2.5 + total_prevented_kg * 2.5, 1)
        cost_saved = round((total_rescued_kg + total_prevented_kg) * 65.0, 2)
        water_saved = round((total_rescued_kg + total_prevented_kg) * 1000.0, 1)

        imp = ImpactMetric(
            institution_id=inst.id,
            metric_date=today,
            food_rescued_kg=round(total_rescued_kg, 1),
            meals_redistributed=total_meals_rescued,
            waste_prevented_kg=round(total_prevented_kg, 1),
            co2e_avoided_kg=co2e_avoided,
            cost_saved_inr=cost_saved,
            water_conserved_litres=water_saved
        )
        session.add(imp)

        await session.commit()
        print("Database successfully seeded with 12 months of realistic data!")
        print(f"Summary: Rescued {total_meals_rescued:,} meals | Prevented {total_prevented_kg:,.1f} kg waste | CO2e Avoided: {co2e_avoided:,.1f} kg")
    except Exception as e:
        print(f"Notice/error during seed_database: {e}")

if __name__ == "__main__":
    asyncio.run(seed_database())
