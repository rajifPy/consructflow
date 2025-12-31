-- ============================================
-- CONSTRUCTFLOW DATABASE SCHEMA WITH RLS
-- File: supabase/migrations/001_initial_schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- Extend Supabase auth.users with custom profile
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'procurement_officer', 'equipment_manager', 'foreman', 'worker')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROJECTS
-- ============================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  client_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15,2),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  project_manager_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MATERIALS & PROCUREMENT
-- ============================================

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity_on_hand DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  unit_cost DECIMAL(10,2),
  supplier_id UUID REFERENCES public.suppliers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  total_amount DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'ordered', 'received', 'cancelled')),
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  attachment_url TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.po_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EQUIPMENT MANAGEMENT
-- ============================================

CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  purchase_date DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'maintenance', 'retired')),
  current_project_id UUID REFERENCES public.projects(id),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER DEFAULT 90,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  maintenance_type TEXT CHECK (maintenance_type IN ('routine', 'repair', 'inspection')),
  description TEXT,
  cost DECIMAL(10,2),
  performed_by UUID REFERENCES public.user_profiles(id),
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CREW MANAGEMENT
-- ============================================

CREATE TABLE public.crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  foreman_id UUID REFERENCES public.user_profiles(id),
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  role TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DAILY LOGS (CORE INTEGRATION POINT)
-- ============================================

CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES public.crews(id),
  weather TEXT,
  activities JSONB, -- [{description: "Casting lantai 2", hours_worked: 8}]
  materials_used JSONB, -- [{material_id: "uuid", quantity_used: 10}]
  equipment_used JSONB, -- [{equipment_id: "uuid", hours_operated: 6}]
  progress_photos TEXT[], -- Array of Supabase Storage URLs
  issues TEXT,
  notes TEXT,
  submitted_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

CREATE POLICY "Everyone can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and PMs can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "Admins and assigned PMs can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'project_manager' AND id = project_manager_id))
    )
  );

-- ============================================
-- MATERIALS POLICIES
-- ============================================

CREATE POLICY "Users can view materials for their projects"
  ON public.materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      LEFT JOIN public.crews c ON c.foreman_id = up.id
      WHERE up.id = auth.uid()
      AND (
        up.role IN ('admin', 'procurement_officer')
        OR c.project_id = materials.project_id
      )
    )
  );

CREATE POLICY "Procurement officers can manage materials"
  ON public.materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'procurement_officer')
    )
  );

-- ============================================
-- PURCHASE ORDERS POLICIES
-- ============================================

CREATE POLICY "Authorized users can view POs"
  ON public.purchase_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'procurement_officer', 'project_manager')
    )
  );

CREATE POLICY "Procurement officers can create POs"
  ON public.purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'procurement_officer')
    )
  );

CREATE POLICY "Procurement officers can update draft POs"
  ON public.purchase_orders FOR UPDATE
  TO authenticated
  USING (
    status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'procurement_officer')
    )
  );

-- ============================================
-- EQUIPMENT POLICIES
-- ============================================

CREATE POLICY "Everyone can view equipment"
  ON public.equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Equipment managers can manage equipment"
  ON public.equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'equipment_manager')
    )
  );

-- ============================================
-- DAILY LOGS POLICIES (CRITICAL)
-- ============================================

CREATE POLICY "Users can view logs for their projects"
  ON public.daily_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      LEFT JOIN public.crews c ON c.foreman_id = up.id
      LEFT JOIN public.projects p ON p.project_manager_id = up.id
      WHERE up.id = auth.uid()
      AND (
        up.role = 'admin'
        OR c.project_id = daily_logs.project_id
        OR p.id = daily_logs.project_id
      )
    )
  );

CREATE POLICY "Foremen can create logs for their crews"
  ON public.daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crews
      WHERE id = crew_id
      AND foreman_id = auth.uid()
    )
  );

CREATE POLICY "Foremen can update their crew logs"
  ON public.daily_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crews
      WHERE id = crew_id
      AND foreman_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: Update material quantity when daily log is created/updated
CREATE OR REPLACE FUNCTION update_material_quantities()
RETURNS TRIGGER AS $$
DECLARE
  material_item JSONB;
BEGIN
  -- Loop through materials_used array
  IF NEW.materials_used IS NOT NULL THEN
    FOR material_item IN SELECT * FROM jsonb_array_elements(NEW.materials_used)
    LOOP
      UPDATE public.materials
      SET quantity_on_hand = quantity_on_hand - (material_item->>'quantity_used')::DECIMAL
      WHERE id = (material_item->>'material_id')::UUID
      AND project_id = NEW.project_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_material_quantities
  AFTER INSERT ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_material_quantities();

-- Function: Calculate PO total amount
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.purchase_orders
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.po_items
    WHERE po_id = NEW.po_id
  )
  WHERE id = NEW.po_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_po_total
  AFTER INSERT OR UPDATE OR DELETE ON public.po_items
  FOR EACH ROW EXECUTE FUNCTION update_po_total();

-- Function: Auto-generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.po_number IS NULL THEN
    NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('po_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE po_number_seq;

CREATE TRIGGER trigger_generate_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION generate_po_number();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_materials_project_id ON public.materials(project_id);
CREATE INDEX idx_materials_low_stock ON public.materials(project_id) WHERE quantity_on_hand <= reorder_level;
CREATE INDEX idx_po_project_id ON public.purchase_orders(project_id);
CREATE INDEX idx_po_status ON public.purchase_orders(status);
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_project_id ON public.equipment(current_project_id);
CREATE INDEX idx_daily_logs_project_id ON public.daily_logs(project_id);
CREATE INDEX idx_daily_logs_date ON public.daily_logs(log_date);
CREATE INDEX idx_crews_foreman_id ON public.crews(foreman_id);

-- ============================================
-- SAMPLE DATA (Optional for testing)
-- ============================================

-- Insert sample admin user profile (replace with your auth.users id)
-- INSERT INTO public.user_profiles (id, full_name, role)
-- VALUES ('YOUR_AUTH_USER_ID', 'Admin User', 'admin');