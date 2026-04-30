<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Worker\Worker;
use App\Models\Hikvision\HikvisionAccessEvent;
use App\Services\AttendanceService;

class BackfillAttendancesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:backfill {--from=} {--to=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill attendances table from existing hikvision_access_events';

    /**
     * Execute the console command.
     */
    public function handle(AttendanceService $attendanceService)
    {
        $this->info('Starting attendance backfill...');

        $from = $this->option('from') ?? '2020-01-01';
        $to = $this->option('to') ?? date('Y-m-d');

        // Clear existing attendances in the date range if needed?
        // Let's just create new ones. Warning: running this twice will create duplicates if not careful.
        // It's better to truncate the table before a full backfill
        if ($this->confirm('Do you want to truncate the attendances table before backfilling?', true)) {
            \App\Models\Attendance\Attendance::truncate();
            $this->info('Attendances table truncated.');
        }

        $eventsQuery = HikvisionAccessEvent::with('hikvisionAccess')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->orderBy('created_at', 'asc');

        $totalEvents = $eventsQuery->count();
        $this->info("Found {$totalEvents} events to process.");

        $bar = $this->output->createProgressBar($totalEvents);
        $bar->start();

        // Load all workers into memory to save DB queries if it's not too large
        $workers = Worker::all()->keyBy('employeeNoString');

        $eventsQuery->chunk(1000, function ($events) use ($bar, $workers, $attendanceService) {
            foreach ($events as $event) {
                $worker = $workers->get($event->employeeNoString);
                
                if ($worker) {
                    try {
                        match($event->attendanceStatus) {
                            'checkIn', 'keldi', 'entered' => $attendanceService->handleCheckIn($worker, $event),
                            'checkOut', 'ketdi', 'exited' => $attendanceService->handleCheckOut($worker, $event),
                            'breakOut', 'Obetga ketdi' => $attendanceService->handleBreakOut($worker, $event),
                            'breakIn', 'Obetdan keldi' => $attendanceService->handleBreakIn($worker, $event),
                            default => null,
                        };
                    } catch (\Exception $e) {
                        // ignore or log
                    }
                }
                
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Backfill completed successfully.');
    }
}
