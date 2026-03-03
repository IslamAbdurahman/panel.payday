<?php

namespace Database\Seeders;

use App\Models\Day;
use Illuminate\Database\Seeder;

class DaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $days = [
            ['name' => 'Yakshanba',  'name_ru' => 'Воскресенье', 'name_en' => 'Sunday',    'index' => 1],
            ['name' => 'Dushanba',   'name_ru' => 'Понедельник', 'name_en' => 'Monday',    'index' => 2],
            ['name' => 'Seshanba',   'name_ru' => 'Вторник',     'name_en' => 'Tuesday',   'index' => 3],
            ['name' => 'Chorshanba', 'name_ru' => 'Среда',       'name_en' => 'Wednesday', 'index' => 4],
            ['name' => 'Payshanba',  'name_ru' => 'Четверг',     'name_en' => 'Thursday',  'index' => 5],
            ['name' => 'Juma',       'name_ru' => 'Пятница',     'name_en' => 'Friday',    'index' => 6],
            ['name' => 'Shanba',     'name_ru' => 'Суббота',     'name_en' => 'Saturday',  'index' => 7],
        ];

        foreach ($days as $day) {
            Day::updateOrCreate(
                ['index' => $day['index']], // unique identifier
                $day // data to insert or update
            );
        }
    }
}
