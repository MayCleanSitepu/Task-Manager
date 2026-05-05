import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ScheduleCalendarProps {
  calendarRef: React.RefObject<FullCalendar | null>;
  events: any[];
  onDatesSet: (info: any) => void;
  onEventChange: (info: any) => void;
  onEventClick: (info: any) => void;
  loading: boolean;
}

export function ScheduleCalendar({
  calendarRef,
  events,
  onDatesSet,
  onEventChange,
  onEventClick,
  loading
}: ScheduleCalendarProps) {
  return (
    <div className="lg:col-span-9">
      <Card className="overflow-hidden shadow-sm border-slate-200 bg-white">
        <div className="p-1 relative">
          {loading && (
            <div className="absolute top-16 right-4 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Syncing...</span>
            </div>
          )}
          
          <style jsx global>{`
            .fc { --fc-border-color: #e2e8f0; --fc-button-bg-color: #fff; --fc-button-border-color: #d0d7de; --fc-button-text-color: #24292f; --fc-button-hover-bg-color: #f6f8fa; --fc-button-active-bg-color: #ebeff2; font-family: inherit; }
            .fc .fc-toolbar-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
            .fc .fc-button { font-size: 0.7rem; font-weight: 600; text-transform: capitalize; padding: 0.3rem 0.6rem; border-radius: 6px; }
            .fc .fc-toolbar { flex-direction: column; gap: 1rem; }
            @media (min-width: 768px) {
              .fc .fc-toolbar { flex-direction: row; }
              .fc .fc-toolbar-title { font-size: 1.1rem; }
              .fc .fc-button { font-size: 0.75rem; padding: 0.4rem 0.8rem; }
            }
            .fc .fc-event { cursor: pointer; border-radius: 4px; border-left-width: 4px !important; padding: 1px 4px; }
            .fc .fc-timegrid-slot { height: 3rem !important; }
            .fc .fc-col-header-cell-cushion { font-size: 0.65rem; font-weight: 600; color: #64748b; padding: 4px; }
            @media (min-width: 768px) {
              .fc .fc-col-header-cell-cushion { font-size: 0.75rem; padding: 8px; }
            }
          `}</style>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth'
            }}
            events={events}
            datesSet={onDatesSet}
            height="auto"
            nowIndicator={true}
            editable={true}
            eventDrop={onEventChange}
            eventResize={onEventChange}
            slotMinTime="00:00:00"
            slotMaxTime="23:59:59"
            allDaySlot={false}
            eventClick={onEventClick}
          />
        </div>
      </Card>
    </div>
  );
}
