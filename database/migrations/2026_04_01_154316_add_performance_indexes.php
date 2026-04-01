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
        Schema::table('hikvision_access_events', function (Blueprint $table) {
            $table->index(['employeeNoString', 'created_at'], 'hae_emp_no_created_at_index');
        });

        Schema::table('worker_holidays', function (Blueprint $table) {
            $table->index(['worker_id', 'from', 'to'], 'wh_worker_from_to_index');
        });

        Schema::table('branch_holidays', function (Blueprint $table) {
            $table->index(['branch_id', 'date'], 'bh_branch_date_index');
        });

        Schema::table('firm_holidays', function (Blueprint $table) {
            $table->index(['firm_id', 'date'], 'fh_firm_date_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hikvision_access_events', function (Blueprint $table) {
            $table->dropIndex('hae_emp_no_created_at_index');
        });

        Schema::table('worker_holidays', function (Blueprint $table) {
            $table->dropIndex('wh_worker_from_to_index');
        });

        Schema::table('branch_holidays', function (Blueprint $table) {
            $table->dropIndex('bh_branch_date_index');
        });

        Schema::table('firm_holidays', function (Blueprint $table) {
            $table->dropIndex('fh_firm_date_index');
        });
    }
};
