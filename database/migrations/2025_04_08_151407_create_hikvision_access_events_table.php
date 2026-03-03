<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hikvision_access_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hikvision_access_id');
            $table->foreign('hikvision_access_id')->on('hikvision_accesses')->references('id')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->string('deviceName')->nullable();
            $table->string('majorEventType')->nullable();
            $table->string('subEventType')->nullable();
            $table->string('name')->nullable();
            $table->integer('cardReaderNo')->nullable();
            $table->string('employeeNoString')->nullable();
            $table->string('serialNo')->nullable();
            $table->string('userType')->nullable();
            $table->string('currentVerifyMode')->nullable();
            $table->string('frontSerialNo')->nullable();
            $table->string('attendanceStatus')->nullable();
            $table->string('label')->nullable();
            $table->string('mask')->nullable();
            $table->integer('picturesNumber')->nullable();
            $table->string('purePwdVerifyEnable')->nullable();
            $table->string('picture')->nullable();
            $table->time('work_time')->nullable();
            $table->time('end_time')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hikvision_access_events');
    }
};
