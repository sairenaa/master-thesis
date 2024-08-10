import { Pool } from "pg";

export class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'elfAnalyzer',
            password: 'postgresuser123',
            port: 5432
        });
    }

    /**
     * Executes query with optional parameters
     * @param queryString Query to be executed
     * @param parameters Optional parameters
     * @returns Promise
     */
    private query(queryString: string, parameters?: any[]) {
        return this.pool.query(queryString, parameters);
    }

    /**
     * Saves the project image to the database
     * If the ELF location already exists in the database, its ID is used to insert the software components
     * If the ELF location does not exist, it is inserted into the database and its ID is used to insert the software components
     * @param projectImage Project image object containing the software components to be saved
     * @param elfLocation Location of the ELF file
     * @returns A promise that resolves when the transaction is complete
     */
    public saveProjectImage(projectImage: any, elfLocation: string) {
        const pool = this.pool;
        const date = projectImage.$.date;

        return pool.connect().then(function(client) {
            return client.query('BEGIN').then(function() {
                return client.query('SELECT id FROM elf WHERE elf = $1', [elfLocation]).then(function(res) {
                    if (res.rows.length > 0) {
                        return res.rows[0].id;
                    } else {
                        return client.query('INSERT INTO elf (elf) VALUES ($1) RETURNING id', [elfLocation]).then(function(res) {
                            return res.rows[0].id;
                        });
                    }
                })
                .then(function(elfId) {
                    const componentPromises = projectImage.SWC.map(function(component: any) {
                        return client.query('INSERT INTO softwarecomponent (elf, name, size, date) VALUES ($1, $2, $3, $4)', 
                                            [elfId, component.$.name, component.$.size, date]);
                    });

                    return Promise.all(componentPromises);
                });
            })
            .then(function() {
                return client.query('COMMIT');
            })
            .catch(function(error) {
                return client.query('ROLLBACK').then(function() {
                    throw error;
                });
            })
            .finally(function() {
                client.release();
            });
        });
    }

    /**
     * Fetches the size data of a software component over time
     * @param componentName Name of the software component
     * @param elfLocation Location of the ELF file
     * @returns Promise that resolves with the data
     */
    public getComponentData(componentName: string, elfLocation: string) {
        return this.query(`
            SELECT sc.date, sc.size 
            FROM softwarecomponent sc
            JOIN elf e ON sc.elf = e.id
            WHERE sc.name = $1 AND e.elf = $2
            ORDER BY sc.date
        `, [componentName, elfLocation])
            .then(function(result) {
                return result.rows;
            });
    }
}